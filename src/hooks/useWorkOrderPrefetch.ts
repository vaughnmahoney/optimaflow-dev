
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWorkOrderPrefetch = (
  workOrderId: string | null,
  currentWorkOrderIndex: number,
  workOrders: { id: string }[]
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!workOrderId) return;

    const prefetchWorkOrder = async (id: string) => {
      // Only prefetch the work order data, not the images separately
      await queryClient.prefetchQuery({
        queryKey: ["workOrder", id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("work_orders")
            .select(`*, technicians (name)`)
            .eq("id", id)
            .single();
          if (error) throw error;
          return data;
        }
      });
    };

    // Prefetch next work order
    if (currentWorkOrderIndex < workOrders.length - 1) {
      prefetchWorkOrder(workOrders[currentWorkOrderIndex + 1].id);
    }
    // Prefetch previous work order
    if (currentWorkOrderIndex > 0) {
      prefetchWorkOrder(workOrders[currentWorkOrderIndex - 1].id);
    }
  }, [workOrderId, currentWorkOrderIndex, workOrders, queryClient]);
};
