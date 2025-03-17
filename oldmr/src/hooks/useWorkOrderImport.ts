
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for importing work orders from OptimoRoute
 */
export const useWorkOrderImport = () => {
  const queryClient = useQueryClient();

  const searchOptimoRoute = async (orderNo: string) => {
    if (!orderNo.trim()) {
      toast.error("Please enter an order number");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('search-optimoroute', {
        body: { searchQuery: orderNo.trim() }
      });

      if (error) throw error;

      if (data.success && data.workOrderId) {
        toast.success('Order imported successfully');
        // Refetch work orders to show the newly imported one
        queryClient.invalidateQueries({ queryKey: ["workOrders"] });
        // Update the badge count as well
        queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
      } else {
        toast.error(data.error || 'Failed to import order');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import order');
    }
  };

  return {
    searchOptimoRoute
  };
};
