
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/components/workorders/types";
import { transformWorkOrderData } from "@/utils/workOrderUtils";

/**
 * Hook to fetch work orders from Supabase
 */
export const useWorkOrderFetch = (statusFilter: string | null) => {
  return useQuery({
    queryKey: ["workOrders", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("work_orders")
        .select("*")
        .order("timestamp", { ascending: false });
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(transformWorkOrderData);
    }
  });
};
