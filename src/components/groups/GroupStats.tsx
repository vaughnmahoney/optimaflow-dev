import { Users, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GroupStatsProps {
  groupId: string;
}

export const GroupStats = ({ groupId }: GroupStatsProps) => {
  const { data: stats } = useQuery({
    queryKey: ['group-stats', groupId],
    queryFn: async () => {
      // Get technicians count
      const { count: techCount } = await supabase
        .from('technicians')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      // Get technicians IDs first
      const { data: technicians } = await supabase
        .from('technicians')
        .select('id')
        .eq('group_id', groupId);

      const technicianIds = technicians?.map(t => t.id) || [];

      // Get attendance stats for the last 30 days if there are technicians
      let attendanceRate = '0';
      if (technicianIds.length > 0) {
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

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">
          {stats?.techniciansCount || 0} Technicians
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">
          {stats?.attendanceRate || 0}% Attendance
        </span>
      </div>
    </div>
  );
};