
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { WorkOrder, WorkOrderFilters } from "@/components/workorders/types";

/**
 * Hook for work order status-related mutations
 */
export const useStatusMutations = () => {
  const queryClient = useQueryClient();
  const { session, userRole } = useAuth();
  
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
      
      // Handle auto-advancement to next order if current order would be filtered out
      // Only attempt this if we're NOT skipping refresh
      if (!options?.skipRefresh && 
          options?.filters?.status && 
          options.filters.status !== newStatus && 
          options.workOrders && 
          options.onAdvanceToNextOrder) {
        
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
      }

      // If updateLocal is true but skipRefresh is true, we'll update the local cache data
      // This provides instant visual feedback without triggering a re-fetch
      if (options?.updateLocal === true && options?.skipRefresh === true) {
        // Update the local cache data to reflect the status change
        queryClient.setQueriesData(
          { queryKey: ["workOrders"] },
          (oldData: any) => {
            // If there's no old data, we can't update it
            if (!oldData) return oldData;
            
            // Map through the work orders and update the matching one
            const newData = {
              ...oldData,
              data: oldData.data.map((wo: WorkOrder) => {
                if (wo.id === workOrderId) {
                  // Create a copy of the work order with the updated status
                  return {
                    ...wo,
                    status: newStatus,
                    // Add attribution data based on status
                    ...(newStatus === "approved" && {
                      approved_at: actionData.action_timestamp,
                      approved_by: userId,
                      approved_user: username
                    }),
                    ...(newStatus === "flagged" && {
                      flagged_at: actionData.action_timestamp,
                      flagged_by: userId,
                      flagged_user: username
                    }),
                    ...(newStatus === "resolved" && {
                      resolved_at: actionData.action_timestamp,
                      resolved_by: userId,
                      resolved_user: username
                    }),
                    ...(newStatus === "rejected" && {
                      rejected_at: actionData.action_timestamp,
                      rejected_by: userId,
                      rejected_user: username
                    }),
                    last_action_at: actionData.action_timestamp,
                    last_action_by: userId,
                    last_action_user: username
                  };
                }
                return wo;
              })
            };
            return newData;
          }
        );
      }
      
      // Only invalidate queries if skipRefresh is not true
      if (!options?.skipRefresh) {
        // Immediately refetch work orders and the badge count
        queryClient.invalidateQueries({ queryKey: ["workOrders"] });
        queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  /**
   * Resolve a flagged work order
   */
  const resolveWorkOrderFlag = async (
    workOrderId: string, 
    resolution: string,
    options?: { 
      filters?: WorkOrderFilters, 
      workOrders?: WorkOrder[], 
      onAdvanceToNextOrder?: (nextOrderId: string) => void,
      skipRefresh?: boolean, // Skip refreshing queries
      updateLocal?: boolean // Update local data without full refresh
    }
  ) => {
    try {
      const timestamp = new Date().toISOString();
      const newStatus = resolution === "followup" ? "flagged_followup" : resolution;
      
      // Include user information in the resolution
      const updateData = { 
        status: newStatus,
        resolved_at: timestamp,
        resolved_by: userId,
        resolved_user: username
      };
      
      const { error } = await supabase
        .from('work_orders')
        .update(updateData)
        .eq('id', workOrderId);

      if (error) throw error;
      
      // Handle auto-advancement to next order if current order would be filtered out
      // Only attempt this if we're NOT skipping refresh
      if (!options?.skipRefresh &&
          options?.filters?.status && 
          options.filters.status !== newStatus && 
          options.workOrders && 
          options.onAdvanceToNextOrder) {
        
        // Special handling for 'flagged' filter status
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
      }

      // If updateLocal is true but skipRefresh is true, we'll update the local cache data
      // This provides instant visual feedback without triggering a re-fetch
      if (options?.updateLocal === true && options?.skipRefresh === true) {
        // Update the local cache data to reflect the status change
        queryClient.setQueriesData(
          { queryKey: ["workOrders"] },
          (oldData: any) => {
            // If there's no old data, we can't update it
            if (!oldData) return oldData;
            
            // Map through the work orders and update the matching one
            const newData = {
              ...oldData,
              data: oldData.data.map((wo: WorkOrder) => {
                if (wo.id === workOrderId) {
                  // Create a copy of the work order with the updated status
                  return {
                    ...wo,
                    status: newStatus,
                    resolved_at: timestamp,
                    resolved_by: userId,
                    resolved_user: username,
                    last_action_at: timestamp,
                    last_action_by: userId,
                    last_action_user: username
                  };
                }
                return wo;
              })
            };
            return newData;
          }
        );
      }
      
      // Only invalidate queries if skipRefresh is not true
      if (!options?.skipRefresh) {
        // Immediately refetch work orders and the badge count
        queryClient.invalidateQueries({ queryKey: ["workOrders"] });
        queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
      }
    } catch (error) {
      console.error('Flag resolution error:', error);
    }
  };

  return {
    updateWorkOrderStatus,
    resolveWorkOrderFlag
  };
};
