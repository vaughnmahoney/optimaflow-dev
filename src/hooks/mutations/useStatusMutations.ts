
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

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

  /**
   * Resolve a flagged work order
   */
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

  return {
    updateWorkOrderStatus,
    resolveWorkOrderFlag
  };
};
