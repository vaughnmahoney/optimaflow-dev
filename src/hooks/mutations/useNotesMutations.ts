
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNotesMutations = () => {
  const queryClient = useQueryClient();

  // QC Notes Mutation
  const updateWorkOrderQcNotes = useMutation({
    mutationFn: async ({ workOrderId, qcNotes }: { workOrderId: string; qcNotes: string }) => {
      const { data, error } = await supabase
        .from('work_orders')
        .update({ qc_notes: qcNotes })
        .eq('id', workOrderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success('QC notes updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['work-orders'],
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to update QC notes: ${error.message}`);
    },
  });

  // Resolution Notes Mutation
  const updateWorkOrderResolutionNotes = useMutation({
    mutationFn: async ({
      workOrderId,
      resolutionNotes,
    }: {
      workOrderId: string;
      resolutionNotes: string;
    }) => {
      const { data, error } = await supabase
        .from('work_orders')
        .update({ resolution_notes: resolutionNotes })
        .eq('id', workOrderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success('Resolution notes updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['work-orders'],
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to update resolution notes: ${error.message}`);
    },
  });

  // Safety Notes Mutation
  const updateWorkOrderSafetyNotes = useMutation({
    mutationFn: async ({
      workOrderId,
      safetyNotes,
    }: {
      workOrderId: string;
      safetyNotes: string;
    }) => {
      const { data, error } = await supabase
        .from('work_orders')
        .update({ safety_notes: safetyNotes })
        .eq('id', workOrderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.safetyNotes 
          ? 'Safety notes updated successfully' 
          : 'Safety notes removed successfully'
      );
      queryClient.invalidateQueries({
        queryKey: ['work-orders'],
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to update safety notes: ${error.message}`);
    },
  });

  return {
    updateWorkOrderQcNotes,
    updateWorkOrderResolutionNotes,
    updateWorkOrderSafetyNotes
  };
};
