
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { WorkOrder, WorkOrderFilters } from "@/components/workorders/types";
import { useLocalStateUpdate } from "./useLocalStateUpdate";

/**
 * Hook for updating work order status
 */
export const useStatusUpdate = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { updateLocalWorkOrderState, updateBadgeCounts } = useLocalStateUpdate();
  
  // Get current user info for tracking actions
  const userId = session?.user?.id;
  const userEmail = session?.user?.email || "";
  const username = userEmail.split('@')[0] || "Unknown user";

  /**
   * Update the status of a work order
   */
  const updateWorkOrderStatus = async (
    workOrderId: string, 
    newStatus: string, 
    options?: { 
      filters?: WorkOrderFilters, 
      workOrders?: WorkOrder[], 
      onAdvanceToNextOrder?: (nextOrderId: string) => void,
      skipRefresh?: boolean, // Skip refreshing queries
      updateLocal?: boolean // Update local data without full refresh
    }
  ) => {
    try {
      // Create an action record with user information
      const timestamp = new Date().toISOString();
      const actionData = {
        status: newStatus,
        action_by: userId, 
        action_user: username,
        action_timestamp: timestamp
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
      
      // Handle auto-advancement to next order if current order would be filtered out
      handleAutoAdvancement(workOrderId, newStatus, options);
      
      // Update local state if requested
      if (options?.updateLocal === true) {
        updateLocalWorkOrderState(workOrderId, newStatus, userId!, username, timestamp);
      }
      
      // Update badge counts separately, even when skipping main refresh
      updateBadgeCounts();
      
      // Only invalidate main query if skipRefresh is not true
      if (!options?.skipRefresh) {
        queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  /**
   * Handle auto-advancement to the next order when filtering would remove the current order
   */
  const handleAutoAdvancement = (
    workOrderId: string,
    newStatus: string,
    options?: {
      filters?: WorkOrderFilters,
      workOrders?: WorkOrder[],
      onAdvanceToNextOrder?: (nextOrderId: string) => void,
      skipRefresh?: boolean
    }
  ) => {
    // Only attempt this if we're NOT skipping refresh
    if (options?.skipRefresh || 
        !options?.filters?.status || 
        !options.workOrders || 
        !options.onAdvanceToNextOrder) {
      return;
    }
    
    // Special handling for 'flagged' filter status which includes flagged_followup
    const willBeFilteredOut = options.filters.status === 'flagged' 
      ? (newStatus !== 'flagged' && newStatus !== 'flagged_followup')
      : (options.filters.status !== newStatus);
    
    if (willBeFilteredOut) {
      // Find the current work order's index
      const currentIndex = options.workOrders.findIndex(wo => wo.id === workOrderId);
      if (currentIndex !== -1) {
        // Try to get the next order
        const nextOrder = options.workOrders[currentIndex + 1];
        // If there's no next order, try to get the previous order
        const previousOrder = currentIndex > 0 ? options.workOrders[currentIndex - 1] : null;
        
        // Advance to next order if available, otherwise previous order
        const nextWorkOrder = nextOrder || previousOrder;
        
        if (nextWorkOrder) {
          options.onAdvanceToNextOrder(nextWorkOrder.id);
        }
      }
    }
  };

  return { updateWorkOrderStatus };
};
