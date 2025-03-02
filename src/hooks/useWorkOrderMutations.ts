
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for work order mutations (update status, delete)
 */
export const useWorkOrderMutations = () => {
  const queryClient = useQueryClient();

  const updateWorkOrderStatus = async (workOrderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
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

  return {
    updateWorkOrderStatus,
    updateWorkOrderQcNotes,
    deleteWorkOrder
  };
};
