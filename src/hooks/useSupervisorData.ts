
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
        .select('*, technicians(id)')
        .order('name');
      
      if (error) throw error;
      return data as (Group & { technicians: { id: string }[] })[];
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

  const submitToHistoryMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      // Use proper typing for the RPC function name
      const { error } = await supabase.rpc(
        'submit_attendance_to_history' as 'submit_attendance_to_history',
        { submission_date: today }
      );
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-review'] });
      queryClient.invalidateQueries({ queryKey: ['today-submissions'] });
    }
  });

  // Only consider groups with technicians for submission requirement
  const allGroupsSubmitted = groups && todaySubmissions && 
    groups.length > 0 && 
    groups.every(group => {
      // Skip empty groups
      if (!group.technicians?.length) return true;
      // Find submission for this group
      const submission = todaySubmissions.find(s => s.group_id === group.id);
      return submission?.is_submitted;
    });

  return {
    groups,
    isLoading,
    error,
    todaySubmissions,
    allGroupsSubmitted,
    undoAllSubmissionsMutation,
    submitToHistoryMutation,
  };
};
