
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AttendanceRecord, Technician } from "@/types/attendance";

export const useAttendanceHistory = () => {
  const { toast } = useToast();

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      try {
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
      } catch (error) {
        console.error('Failed to fetch technicians:', error);
        toast({
          title: "Error",
          description: "Failed to load technicians. Please try refreshing the page.",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const { data: attendanceRecords = [], isLoading, error: attendanceError } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      try {
        console.log('Starting attendance records fetch...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('No active session found');
          throw new Error("Not authenticated");
        }
        console.log('Session found, user ID:', session.user.id);

        const { data, error } = await supabase
          .from('attendance_records')
          .select(`
            *,
            technician:technicians(name)
          `)
          .eq('supervisor_id', session.user.id)
          .order('date', { ascending: false });
        
        if (error) {
          console.error('Error fetching attendance records:', error);
          throw error;
        }
        
        console.log('Raw attendance records:', data);
        return data as AttendanceRecord[];
      } catch (error) {
        console.error('Failed to fetch attendance records:', error);
        toast({
          title: "Error",
          description: "Failed to load attendance records. Please try refreshing the page.",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    staleTime: 0, // Always fetch fresh data
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
    error: attendanceError,
    getTechnicianName,
  };
};
