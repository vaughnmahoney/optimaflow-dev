import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkOrder } from '@/components/workorders/types';

export const useNotesMutations = () => {
  const updateWorkOrderQcNotes = async (
    workOrderId: string, 
    qcNotes: string, 
    options: { 
      skipRefresh?: boolean; 
      updateLocal?: boolean; 
    } = {}
  ) => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .update({ 
          qc_notes: qcNotes,
          last_action_by: 'current_user', // Adjust as needed
          last_action_at: new Date().toISOString()
        })
        .eq('id', workOrderId)
        .select()
        .single();

      if (error) throw error;

      toast.success('QC notes updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating QC notes:', error);
      toast.error('Failed to update QC notes');
      return null;
    }
  };

  const updateWorkOrderResolutionNotes = async (
    workOrderId: string, 
    resolutionNotes: string, 
    options: { 
      skipRefresh?: boolean; 
      updateLocal?: boolean; 
    } = {}
  ) => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .update({ 
          resolution_notes: resolutionNotes,
          last_action_by: 'current_user', // Adjust as needed
          last_action_at: new Date().toISOString()
        })
        .eq('id', workOrderId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Resolution notes updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating resolution notes:', error);
      toast.error('Failed to update resolution notes');
      return null;
    }
  };

  const updateWorkOrderSafetyNotes = async (
    workOrderId: string, 
    safetyNotes: string, 
    options: { 
      skipRefresh?: boolean; 
      updateLocal?: boolean; 
    } = {}
  ) => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .update({ 
          safety_notes: safetyNotes,
          last_action_by: 'current_user', // Adjust as needed
          last_action_at: new Date().toISOString()
        })
        .eq('id', workOrderId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Safety notes updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating safety notes:', error);
      toast.error('Failed to update safety notes');
      return null;
    }
  };

  return {
    updateWorkOrderQcNotes,
    updateWorkOrderResolutionNotes,
    updateWorkOrderSafetyNotes
  };
};
