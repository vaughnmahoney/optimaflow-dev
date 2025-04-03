
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for work order notes-related mutations
 */
export const useNotesMutations = () => {
  const queryClient = useQueryClient();

  /**
   * Update the QC notes for a work order
   */
  const updateWorkOrderQcNotes = async (workOrderId: string, qcNotes: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ qc_notes: qcNotes })
        .eq('id', workOrderId);

      if (error) throw error;

      // Update the local cache without triggering a full refetch that would filter out the work order
      queryClient.setQueriesData(
        { queryKey: ["workOrders"] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          const newData = {
            ...oldData,
            data: oldData.data.map((wo: any) => 
              wo.id === workOrderId ? { ...wo, qc_notes: qcNotes } : wo
            )
          };
          return newData;
        }
      );
      
      // Also update badge counts separately without affecting the current view
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
    } catch (error) {
      console.error('QC notes update error:', error);
      throw error; // We'll handle this in the component
    }
  };

  /**
   * Update the resolution notes for a work order
   */
  const updateWorkOrderResolutionNotes = async (workOrderId: string, resolutionNotes: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ resolution_notes: resolutionNotes })
        .eq('id', workOrderId);

      if (error) throw error;

      // Update the local cache without triggering a full refetch that would filter out the work order
      queryClient.setQueriesData(
        { queryKey: ["workOrders"] },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          const newData = {
            ...oldData,
            data: oldData.data.map((wo: any) => 
              wo.id === workOrderId ? { ...wo, resolution_notes: resolutionNotes } : wo
            )
          };
          return newData;
        }
      );
      
      // Also update badge counts separately without affecting the current view
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
    } catch (error) {
      console.error('Resolution notes update error:', error);
      throw error;
    }
  };

  return {
    updateWorkOrderQcNotes,
    updateWorkOrderResolutionNotes
  };
};
