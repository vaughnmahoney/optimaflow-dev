import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkOrder } from "@/components/workorders/types";
import { useWorkOrderStatusCounts } from "./useWorkOrderStatusCounts";
import { useWorkOrderMutations } from "./useWorkOrderMutations";

export const useWorkOrderData = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all work orders without filtering or pagination
  const { 
    data: workOrders = [], 
    isLoading: isQueryLoading, 
    refetch 
  } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      console.log("Fetching all work orders without filtering or pagination");
      
      const { data, error } = await supabase
        .from("work_orders")
        .select("*");
      
      if (error) {
        console.error("Error fetching work orders:", error);
        throw error;
      }
      
      return data || [];
    },
    placeholderData: [],
    staleTime: 30000,
    gcTime: 600000
  });
  
  // Calculate status counts
  const statusCounts = useWorkOrderStatusCounts(workOrders);
  
  // Import utility hooks for mutations
  const { updateWorkOrderStatus, deleteWorkOrder } = useWorkOrderMutations();

  // Import function from OptimoRoute integration
  const searchOptimoRoute = async (orderNumber: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-optimoroute', {
        body: { searchQuery: orderNumber }
      });

      if (error) throw error;

      if (data.success && data.workOrderId) {
        toast.success('OptimoRoute order found');
        refetch();
      } else {
        toast.error(data.error || 'Failed to find OptimoRoute order');
      }
    } catch (error) {
      console.error('OptimoRoute search error:', error);
      toast.error('Failed to search OptimoRoute');
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for image viewer (to be implemented)
  const openImageViewer = (workOrderId: string) => {
    console.log(`Opening images for work order: ${workOrderId}`);
  };

  return {
    data: workOrders,
    isLoading: isLoading || isQueryLoading,
    searchOptimoRoute,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder,
    statusCounts,
    refetch
  };
};
