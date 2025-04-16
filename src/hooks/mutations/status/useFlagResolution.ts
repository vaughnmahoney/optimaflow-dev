
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { WorkOrder, WorkOrderFilters } from "@/components/workorders/types";
import { useLocalStateUpdate } from "./useLocalStateUpdate";

/**
 * Hook for resolving flagged work orders
 */
export const useFlagResolution = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { updateLocalWorkOrderState, updateBadgeCounts } = useLocalStateUpdate();
  
  // Get current user info for tracking actions
  const userId = session?.user?.id;
  const userEmail = session?.user?.email || "";
  const username = userEmail.split('@')[0] || "Unknown user";

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
      console.error('Flag resolution error:', error);
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
  };

  return { resolveWorkOrderFlag };
};
