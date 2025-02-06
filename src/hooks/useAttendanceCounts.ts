
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Group } from "@/types/groups";

export const useAttendanceCounts = (groups: Group[], date: string) => {
  return useQuery({
    queryKey: ['attendance-counts', date],
    queryFn: async () => {
      const { data: technicians } = await supabase
        .from('technicians')
        .select('id, group_id');

      const { data: attendanceRecords } = await supabase
        .from('attendance_records')
        .select('technician_id')
        .eq('date', date);

      const counts: Record<string, { completed: number; total: number }> = {};
      
      groups.forEach(group => {
        counts[group.id] = { completed: 0, total: 0 };
      });

      technicians?.forEach(tech => {
        if (tech.group_id && counts[tech.group_id]) {
          counts[tech.group_id].total++;
        }
      });

      attendanceRecords?.forEach(record => {
        const tech = technicians?.find(t => t.id === record.technician_id);
        if (tech?.group_id && counts[tech.group_id]) {
          counts[tech.group_id].completed++;
        }
      });

      return counts;
    },
  });
};
