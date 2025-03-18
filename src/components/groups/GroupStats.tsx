
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GroupStatsProps {
  groupId: string;
}

export const GroupStats = ({ groupId }: GroupStatsProps) => {
  const { data: stats, refetch } = useQuery({
    queryKey: ['group-stats', groupId],
    queryFn: async () => {
      console.log('Fetching stats for group:', groupId);
      // Get technicians count and IDs in one query
      const { data: technicians, count: techCount } = await supabase
        .from('technicians')
        .select('id', { count: 'exact' })
        .eq('group_id', groupId);

      // This section is kept but not displayed in the UI
      let attendanceRate = '0';
      if (technicians?.length) {
        const technicianIds = technicians.map(t => t.id);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: attendanceData } = await supabase
          .from('attendance_records')
          .select('status, technician_id')
          .gte('date', thirtyDaysAgo.toISOString())
          .in('technician_id', technicianIds);

        const totalRecords = attendanceData?.length || 0;
        const presentRecords = attendanceData?.filter(record => record.status === 'present').length || 0;
        attendanceRate = totalRecords ? ((presentRecords / totalRecords) * 100).toFixed(1) : '0';
      }

      return {
        techniciansCount: techCount || 0,
        attendanceRate,
      };
    },
  });

  // Subscribe to attendance_records changes for this group's technicians
  useEffect(() => {
    const fetchTechnicianIds = async () => {
      const { data: technicians } = await supabase
        .from('technicians')
        .select('id')
        .eq('group_id', groupId);
      
      if (!technicians?.length) return;

      const technicianIds = technicians.map(t => t.id);
      console.log('Setting up realtime subscription for technicians:', technicianIds);

      const channel = supabase
        .channel(`attendance-updates-${groupId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'attendance_records',
            filter: `technician_id=in.(${technicianIds.join(',')})`,
          },
          (payload) => {
            console.log('Attendance record changed for group:', groupId, payload);
            refetch();
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for group ${groupId}:`, status);
        });

      return () => {
        console.log('Cleaning up realtime subscription for group:', groupId);
        supabase.removeChannel(channel);
      };
    };

    fetchTechnicianIds();
  }, [groupId, refetch]);

  // Return only the technician count, hiding the attendance percentage
  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm">
        {stats?.techniciansCount || 0} Technicians
      </span>
    </div>
  );
};
