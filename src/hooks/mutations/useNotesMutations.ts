
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNotesMutations = () => {
  const queryClient = useQueryClient();

  // QC Notes Mutation
  const updateWorkOrderQcNotes = async (
    workOrderId: string, 
    qcNotes: string, 
    options?: { skipRefresh?: boolean; updateLocal?: boolean }
  ) => {
    const { data, error } = await supabase
      .from('work_orders')
      .update({ qc_notes: qcNotes })
      .eq('id', workOrderId)
      .select()
      .single();

    if (error) throw error;
    
    if (!options?.skipRefresh) {
      queryClient.invalidateQueries({
        queryKey: ['work-orders'],
      });
    }
    
    toast.success('QC notes updated successfully');
    return data;
  };

  // Resolution Notes Mutation
  const updateWorkOrderResolutionNotes = async (
    workOrderId: string, 
    resolutionNotes: string, 
    options?: { skipRefresh?: boolean; updateLocal?: boolean }
  ) => {
    const { data, error } = await supabase
      .from('work_orders')
      .update({ resolution_notes: resolutionNotes })
      .eq('id', workOrderId)
      .select()
      .single();

    if (error) throw error;
    
    if (!options?.skipRefresh) {
      queryClient.invalidateQueries({
        queryKey: ['work-orders'],
      });
    }
    
    toast.success('Resolution notes updated successfully');
    return data;
  };

  // Safety Notes Mutation
  const updateWorkOrderSafetyNotes = async (
    workOrderId: string, 
    safetyNotes: string, 
    options?: { skipRefresh?: boolean; updateLocal?: boolean }
  ) => {
    const { data, error } = await supabase
      .from('work_orders')
      .update({ safety_notes: safetyNotes })
      .eq('id', workOrderId)
      .select()
      .single();

    if (error) throw error;
    
    if (!options?.skipRefresh) {
      queryClient.invalidateQueries({
        queryKey: ['work-orders'],
      });
    }
    
    toast.success(
      safetyNotes 
        ? 'Safety notes updated successfully' 
        : 'Safety notes removed successfully'
    );
    return data;
  };

  return {
    updateWorkOrderQcNotes,
    updateWorkOrderResolutionNotes,
    updateWorkOrderSafetyNotes
  };
};
