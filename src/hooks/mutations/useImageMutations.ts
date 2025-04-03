
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStatusMutations } from "./useStatusMutations";

/**
 * Hook for work order image-related mutations
 */
export const useImageMutations = () => {
  const queryClient = useQueryClient();
  const { updateWorkOrderStatus } = useStatusMutations();

  /**
   * Toggle the flag status of an image in a work order
   */
  const toggleImageFlag = async (workOrderId: string, imageIndex: number, isFlagged: boolean) => {
    try {
      // Get the current work order to access the completion_response
      const { data: workOrder, error: fetchError } = await supabase
        .from('work_orders')
        .select('completion_response, status')
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
        
        // If flagging an image and work order isn't already flagged, update the work order status
        if (isFlagged && workOrder.status !== "flagged" && workOrder.status !== "flagged_followup") {
          // Use the options to prevent auto-filtering when flagging an image
          await updateWorkOrderStatus(workOrderId, "flagged", {
            skipRefresh: true,
            updateLocal: true
          });
        }
        
        // Show success toast
        toast.success(isFlagged ? 'Image flagged' : 'Image flag removed');
        
        // Update the local cache without triggering a full refetch
        queryClient.setQueriesData(
          { queryKey: ["workOrders"] },
          (oldData: any) => {
            if (!oldData) return oldData;
            
            const newData = {
              ...oldData,
              data: oldData.data.map((wo: any) => {
                if (wo.id === workOrderId) {
                  // Create a shallow copy of the work order
                  const updatedWo = { ...wo };
                  
                  // Update the completion_response with the flagged image
                  if (updatedWo.completion_response?.orders?.[0]?.data?.form?.images) {
                    updatedWo.completion_response.orders[0].data.form.images[imageIndex].flagged = isFlagged;
                  }
                  
                  // If flagging an image, also update the work order status if needed
                  if (isFlagged && wo.status !== "flagged" && wo.status !== "flagged_followup") {
                    updatedWo.status = "flagged";
                  }
                  
                  return updatedWo;
                }
                return wo;
              })
            };
            return newData;
          }
        );
        
        // Update badge counts separately
        queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
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
