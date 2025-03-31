
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for work order image-related mutations
 */
export const useImageMutations = () => {
  const queryClient = useQueryClient();

  /**
   * Toggle the flag status of an image in a work order
   */
  const toggleImageFlag = async (workOrderId: string, imageIndex: number, isFlagged: boolean) => {
    try {
      // Get the current work order to access the completion_response
      const { data: workOrder, error: fetchError } = await supabase
        .from('work_orders')
        .select('completion_response')
        .eq('id', workOrderId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (!workOrder?.completion_response) {
        throw new Error("Work order data not found");
      }
      
      // Clone the completion response to modify it
      const updatedCompletion = JSON.parse(JSON.stringify(workOrder.completion_response));
      
      // Make sure the needed structure exists
      if (updatedCompletion?.orders?.[0]?.data?.form?.images) {
        // Initialize flagged status if it doesn't exist
        if (!updatedCompletion.orders[0].data.form.images[imageIndex].flagged) {
          updatedCompletion.orders[0].data.form.images[imageIndex].flagged = false;
        }
        
        // Toggle the flag status
        updatedCompletion.orders[0].data.form.images[imageIndex].flagged = isFlagged;
        
        // Update the work order with the modified completion response
        const { error: updateError } = await supabase
          .from('work_orders')
          .update({ completion_response: updatedCompletion })
          .eq('id', workOrderId);
        
        if (updateError) throw updateError;
        
        // Show success toast
        toast.success(isFlagged ? 'Image flagged' : 'Image flag removed');
        
        // Refetch work orders to update UI
        queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      }
    } catch (error) {
      console.error('Image flag toggle error:', error);
      toast.error('Failed to update image flag');
    }
  };

  return {
    toggleImageFlag
  };
};
