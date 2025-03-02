
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/components/workorders/types";
import { transformWorkOrderData } from "@/utils/workOrderUtils";

/**
 * Hook to fetch work orders from Supabase with pagination
 */
export const useWorkOrderFetch = (
  statusFilter: string | null,
  page: number = 1,
  pageSize: number = 10,
  sortField: string | null = null,
  sortDirection: string | null = null
) => {
  return useQuery({
    queryKey: ["workOrders", statusFilter, page, pageSize, sortField, sortDirection],
    queryFn: async () => {
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Start building the query
      let query = supabase
        .from("work_orders")
        .select("*", { count: "exact" });
      
      // Apply status filter if provided
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      // Apply sorting if provided
      if (sortField && sortDirection) {
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
      } else {
        // Default sort by timestamp
        query = query.order("timestamp", { ascending: false });
      }
      
      // Apply pagination
      query = query.range(from, to);
      
      // Execute the query
      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data.map(transformWorkOrderData),
        total: count || 0
      };
    }
  });
};
