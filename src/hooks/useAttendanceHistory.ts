import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AttendanceRecord, Technician } from "@/types/attendance";

export const useAttendanceHistory = () => {
  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        throw new Error("Not authenticated");
      }
      console.log('Session found, fetching technicians for supervisor:', session.user.id);

      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('supervisor_id', session.user.id);

      if (error) {
        console.error('Error fetching technicians:', error);
        throw error;
      }
      console.log('Fetched technicians:', data);
      return data;
    },
  });

  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      console.log('Starting attendance records fetch...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        throw new Error("Not authenticated");
      }
      console.log('Session found, user ID:', session.user.id);

      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('supervisor_id', session.user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching attendance records:', error);
        throw error;
      }
      
      console.log('Raw attendance records:', data);
      console.log('Number of records fetched:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('Most recent record:', data[0]);
        console.log('Date of most recent record:', data[0].date);
        console.log('Today\'s date:', new Date().toISOString().split('T')[0]);
      }
      
      return data as AttendanceRecord[];
    },
  });

  const getTechnicianName = (technician_id: string) => {
    const technician = technicians.find((tech) => tech.id === technician_id);
    console.log('Getting name for technician:', technician_id, 'Found:', technician?.name);
    return technician?.name || "Unknown Technician";
  };

  return {
    technicians,
    attendanceRecords,
    isLoading,
    getTechnicianName,
  };
};