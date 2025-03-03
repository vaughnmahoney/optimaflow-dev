
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderFilters } from "@/components/workorders/types";
import { transformWorkOrderData } from "@/utils/workOrderUtils";

/**
 * Hook to fetch work orders from Supabase with pagination and filtering
 */
export const useWorkOrderFetch = (
  filters: WorkOrderFilters,
  page: number = 1,
  pageSize: number = 10,
  sortField: string | null = null,
  sortDirection: string | null = null
) => {
  return useQuery({
    queryKey: ["workOrders", filters, page, pageSize, sortField, sortDirection],
    queryFn: async () => {
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Start building the query
      let query = supabase
        .from("work_orders")
        .select("*", { count: "exact" });
      
      // Apply status filter if provided
      if (filters.status) {
        if (filters.status === 'flagged') {
          // For flagged status, search for both 'flagged' and 'flagged_followup'
          query = query.or('status.eq.flagged,status.eq.flagged_followup');
        } else {
          query = query.eq('status', filters.status);
        }
      }
      
      // Apply sorting if provided
      if (sortField && sortDirection) {
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
      } else {
        // Default sort by timestamp
        query = query.order("timestamp", { ascending: false });
      }
      
      // Apply pagination only if there's no search
      // When searching, we need the full dataset to do client-side filtering
      if (!filters.searchQuery || !filters.searchQuery.trim()) {
        query = query.range(from, to);
      }
      
      // Execute the query
      const { data, error, count } = await query;

      if (error) throw error;

      console.log("Fetched work orders:", data?.length);

      // Transform all data to proper WorkOrder objects
      const transformedOrders = data.map(transformWorkOrderData);
      
      // Apply client-side filtering for text search
      let filteredData = transformedOrders;
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const searchTerm = filters.searchQuery.trim().toLowerCase();
        
        filteredData = transformedOrders.filter(order => {
          // Check order number
          const orderNo = order.order_no.toLowerCase();
          
          // Safe access to nested properties with type guards
          let driverName = '';
          if (order.driver && typeof order.driver === 'object' && order.driver.name) {
            driverName = order.driver.name.toLowerCase();
          }
          
          let locationName = '';
          if (order.location && typeof order.location === 'object') {
            locationName = (order.location.name || order.location.locationName || '').toLowerCase();
          }
          
          // Return true if any field matches the search term
          return (
            orderNo.includes(searchTerm) ||
            driverName.includes(searchTerm) ||
            locationName.includes(searchTerm)
          );
        });
        
        // Apply pagination to filtered results
        const paginatedData = filteredData.slice(from, to + 1);
        return {
          data: paginatedData,
          total: filteredData.length
        };
      }

      return {
        data: filteredData,
        total: count || 0
      };
    }
  });
};
