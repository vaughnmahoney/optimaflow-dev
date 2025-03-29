import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

/**
 * Hook for work order mutations (update status, delete)
 */
export const useWorkOrderMutations = () => {
  const queryClient = useQueryClient();
  const { session, userRole } = useAuth();
  
  // Get current user info for tracking actions
  const userId = session?.user?.id;
  const userEmail = session?.user?.email || "";
  const username = userEmail.split('@')[0] || "Unknown user";

  const updateWorkOrderStatus = async (workOrderId: string, newStatus: string) => {
    try {
      // Create an action record with user information
      const actionData = {
        status: newStatus,
        action_by: userId, 
        action_user: username,
        action_timestamp: new Date().toISOString()
      };
      
      // Use switch to determine which field to update based on status
      let updateData = {};
      
      switch(newStatus) {
        case "approved":
          updateData = { 
            status: newStatus,
            approved_by: userId,
            approved_user: username,
            approved_at: actionData.action_timestamp
          };
          break;
        case "flagged":
        case "flagged_followup":
          updateData = { 
            status: newStatus,
            flagged_by: userId,
            flagged_user: username,
            flagged_at: actionData.action_timestamp
          };
          break;
        case "resolved":
          updateData = { 
            status: newStatus,
            resolved_by: userId, 
            resolved_user: username,
            resolved_at: actionData.action_timestamp
          };
          break;
        case "rejected":
          updateData = { 
            status: newStatus,
            rejected_by: userId,
            rejected_user: username,
            rejected_at: actionData.action_timestamp
          };
          break;
        default:
          // For pending_review status, just update the status
          updateData = { 
            status: newStatus,
            last_action_by: userId,
            last_action_user: username,
            last_action_at: actionData.action_timestamp
          };
      }

      const { error } = await supabase
        .from('work_orders')
        .update(updateData)
        .eq('id', workOrderId);

      if (error) throw error;

      toast.success(`Status updated to ${newStatus}`);
      
      // Immediately refetch work orders and the badge count
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    }
  };

  const updateWorkOrderQcNotes = async (workOrderId: string, qcNotes: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ qc_notes: qcNotes })
        .eq('id', workOrderId);

      if (error) throw error;

      // Refetch work orders to update UI
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      
      // Also directly update this specific work order if it's being viewed
      const cachedWorkOrders = queryClient.getQueryData(["workOrders"]) as any[];
      if (cachedWorkOrders) {
        queryClient.setQueryData(
          ["workOrders"], 
          cachedWorkOrders.map(wo => 
            wo.id === workOrderId ? { ...wo, qc_notes: qcNotes } : wo
          )
        );
      }
    } catch (error) {
      console.error('QC notes update error:', error);
      throw error; // We'll handle this in the component
    }
  };

  const updateWorkOrderResolutionNotes = async (workOrderId: string, resolutionNotes: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ resolution_notes: resolutionNotes })
        .eq('id', workOrderId);

      if (error) throw error;

      // Refetch work orders to update UI
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      
      // Also directly update this specific work order if it's being viewed
      const cachedWorkOrders = queryClient.getQueryData(["workOrders"]) as any[];
      if (cachedWorkOrders) {
        queryClient.setQueryData(
          ["workOrders"], 
          cachedWorkOrders.map(wo => 
            wo.id === workOrderId ? { ...wo, resolution_notes: resolutionNotes } : wo
          )
        );
      }
    } catch (error) {
      console.error('Resolution notes update error:', error);
      throw error;
    }
  };

  const resolveWorkOrderFlag = async (workOrderId: string, resolution: string) => {
    try {
      const timestamp = new Date().toISOString();
      
      // Include user information in the resolution
      const updateData = { 
        status: resolution === "followup" ? "flagged_followup" : resolution,
        resolved_at: timestamp,
        resolved_by: userId,
        resolved_user: username
      };
      
      const { error } = await supabase
        .from('work_orders')
        .update(updateData)
        .eq('id', workOrderId);

      if (error) throw error;

      let statusMessage = "";
      switch(resolution) {
        case "approved":
          statusMessage = "Order approved despite flag";
          break;
        case "rejected":
          statusMessage = "Order rejected";
          break;
        case "followup":
          statusMessage = "Follow-up requested from technician";
          break;
        default:
          statusMessage = "Order status updated";
      }

      toast.success(statusMessage);
      
      // Immediately refetch work orders and the badge count
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
    } catch (error) {
      console.error('Flag resolution error:', error);
      toast.error('Failed to resolve flagged order');
    }
  };

  const deleteWorkOrder = async (workOrderId: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', workOrderId);

      if (error) throw error;

      toast.success('Work order deleted');
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete work order');
    }
  };

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
    updateWorkOrderStatus,
    updateWorkOrderQcNotes,
    updateWorkOrderResolutionNotes,
    resolveWorkOrderFlag,
    deleteWorkOrder,
    toggleImageFlag
  };
};
