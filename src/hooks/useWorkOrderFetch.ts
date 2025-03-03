
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
      
      // Apply column-specific filters
      if (filters.orderNo) {
        query = query.ilike('order_no', `%${filters.orderNo}%`);
      }

      if (filters.dateRange && filters.dateRange.from) {
        query = query.gte('service_date', filters.dateRange.from.toISOString());
      }

      if (filters.dateRange && filters.dateRange.to) {
        query = query.lte('service_date', filters.dateRange.to.toISOString());
      }
      
      // Apply sorting if provided
      if (sortField && sortDirection) {
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
      } else {
        // Default sort by timestamp
        query = query.order("timestamp", { ascending: false });
      }
      
      // Execute the query with pagination
      const { data, error, count } = await query
        .range(from, to);

      if (error) throw error;

      console.log("Fetched work orders:", data?.length);

      // Transform all data to proper WorkOrder objects
      const transformedOrders = data.map(transformWorkOrderData);
      
      // Apply client-side filtering for driver and location 
      // (these are stored as JSON and can't be queried directly in Supabase)
      let filteredData = transformedOrders;
      
      if (filters.driver) {
        const driverSearchTerm = filters.driver.toLowerCase();
        filteredData = filteredData.filter(order => {
          if (!order.driver) return false;
          const driverName = typeof order.driver === 'object' && order.driver.name
            ? order.driver.name.toLowerCase() : '';
          return driverName.includes(driverSearchTerm);
        });
      }
      
      if (filters.location) {
        const locationSearchTerm = filters.location.toLowerCase();
        filteredData = filteredData.filter(order => {
          if (!order.location) return false;
          if (typeof order.location !== 'object') return false;
          
          const locationName = (order.location.name || order.location.locationName || '').toLowerCase();
          return locationName.includes(locationSearchTerm);
        });
      }
      
      return {
        data: filteredData,
        total: count || filteredData.length
      };
    }
  });
};
