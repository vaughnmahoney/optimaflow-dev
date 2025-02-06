
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGroupReview = (groupId: string) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviewStatus, isLoading } = useQuery({
    queryKey: ['group-review', groupId],
    queryFn: async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('group_attendance_review')
          .select('*')
          .eq('group_id', groupId)
          .eq('date', today)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error('Error fetching review status:', error);
        throw error;
      }
    },
  });

  const updateReviewStatus = useMutation({
    mutationFn: async (isReviewed: boolean) => {
      setIsUpdating(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No active session");

        const today = new Date().toISOString().split('T')[0];
        
        // Use upsert instead of insert to handle existing records
        const { data, error } = await supabase
          .from('group_attendance_review')
          .upsert({
            group_id: groupId,
            date: today,
            reviewed_by: session.user.id,
            is_reviewed: isReviewed,
            reviewed_at: isReviewed ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-review'] });
      toast({
        title: "Success",
        description: "Group review status updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating review status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update group review status",
        variant: "destructive",
      });
    },
  });

  return {
    reviewStatus,
    isLoading,
    isUpdating,
    updateReviewStatus,
  };
};
