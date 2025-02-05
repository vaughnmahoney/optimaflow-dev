import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Technician } from "@/types/attendance";

export const useAttendance = (groupId?: string) => {
  const { toast } = useToast();

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ['technicians', groupId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('technicians')
          .select('*');
        
        if (groupId) {
          query = query.eq('group_id', groupId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching technicians:', error);
          throw error;
        }

        return data as Technician[];
      } catch (error: any) {
        console.error('Failed to fetch technicians:', error);
        toast({
          title: "Error",
          description: "Failed to load technicians. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!groupId,
  });

  return {
    technicians,
    isLoadingTechnicians,
  };
};