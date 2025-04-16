
import { useQueryClient } from "@tanstack/react-query";
import { WorkOrder } from "@/components/workorders/types";

/**
 * Utility hook for updating local query cache state
 * This allows us to update the UI instantly without waiting for a refetch
 */
export const useLocalStateUpdate = () => {
  const queryClient = useQueryClient();

  /**
   * Updates local cache data to reflect the new work order status
   */
  const updateLocalWorkOrderState = (
    workOrderId: string, 
    newStatus: string,
    userId: string,
    username: string,
    timestamp: string
  ) => {
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
                  approved_at: timestamp,
                  approved_by: userId,
                  approved_user: username
                }),
                ...(newStatus === "flagged" && {
                  flagged_at: timestamp,
                  flagged_by: userId,
                  flagged_user: username
                }),
                ...(newStatus === "resolved" && {
                  resolved_at: timestamp,
                  resolved_by: userId,
                  resolved_user: username
                }),
                ...(newStatus === "rejected" && {
                  rejected_at: timestamp,
                  rejected_by: userId,
                  rejected_user: username
                }),
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
  };

  /**
   * Updates local cache data for badge counts
   */
  const updateBadgeCounts = () => {
    queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
  };

  return {
    updateLocalWorkOrderState,
    updateBadgeCounts
  };
};
