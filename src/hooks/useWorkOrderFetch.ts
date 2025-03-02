
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
      
      // Global text search across multiple fields
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const searchTerm = filters.searchQuery.trim();
        
        // Search only in the order_no field directly
        // For driver names and location names, we need to use a different approach
        // because they're in JSON fields
        query = query.or(`order_no.ilike.%${searchTerm}%`);
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

      console.log("Fetched work orders:", data?.length);

      // Get all data and then filter client-side for driver and location
      const transformedData = data.map(transformWorkOrderData);
      
      // Apply client-side filtering for driver and location when there's a search term
      let filteredData = transformedData;
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const searchTerm = filters.searchQuery.trim().toLowerCase();
        
        filteredData = transformedData.filter(order => {
          // Check driver name
          const driverName = order.driver?.name?.toLowerCase() || '';
          
          // Check location name
          const locationName = order.location?.name?.toLowerCase() || 
                              order.location?.locationName?.toLowerCase() || '';
          
          // Return true if any field matches the search term
          return (
            order.order_no.toLowerCase().includes(searchTerm) ||
            driverName.includes(searchTerm) ||
            locationName.includes(searchTerm)
          );
        });
      }

      return {
        data: filteredData,
        total: count || 0
      };
    }
  });
};
