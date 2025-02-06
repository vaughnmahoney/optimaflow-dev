
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Group } from "@/types/groups";

export const useSupervisorData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Group[];
    }
  });

  const { data: todaySubmissions } = useQuery({
    queryKey: ['today-submissions'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('group_attendance_review')
        .select('*')
        .eq('date', today);
      
      if (error) throw error;
      return data;
    }
  });

  const undoAllSubmissionsMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('group_attendance_review')
        .update({ is_submitted: false })
        .eq('date', today);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-review'] });
      queryClient.invalidateQueries({ queryKey: ['today-submissions'] });
      toast({
        title: "Success",
        description: "All submissions have been reset for today",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset submissions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const allGroupsSubmitted = groups && todaySubmissions && 
    groups.length > 0 && 
    todaySubmissions.every(submission => submission.is_submitted);

  return {
    groups,
    isLoading,
    error,
    todaySubmissions,
    allGroupsSubmitted,
    undoAllSubmissionsMutation,
  };
};
