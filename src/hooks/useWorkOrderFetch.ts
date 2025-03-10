
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderFilters, SortField, SortDirection } from "@/components/workorders/types";
import { transformWorkOrderData } from "@/utils/workOrderUtils";

/**
 * Hook to fetch work orders from Supabase with pagination and filtering
 * Implements database-level filtering for all filter types and proper server-side pagination
 */
export const useWorkOrderFetch = (
  filters: WorkOrderFilters,
  page: number = 1,
  pageSize: number = 10,
  sortField: SortField = 'service_date',
  sortDirection: SortDirection = 'desc'
) => {
  return useQuery({
    queryKey: ["workOrders", filters, page, pageSize, sortField, sortDirection],
    queryFn: async () => {
      console.log("Fetching work orders with:", { 
        filters, 
        page, 
        pageSize, 
        sortField, 
        sortDirection 
      });
      
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Start building the count query to get total count of filtered records
      let countQuery = supabase
        .from("work_orders")
        .select("id", { count: "exact", head: true });
      
      // Start building the data query to fetch the current page of records
      let dataQuery = supabase
        .from("work_orders")
        .select("*");
      
      // Apply all filters to both queries
      
      // 1. Status filtering
      if (filters.status) {
        if (filters.status === 'flagged') {
          countQuery = countQuery.or('status.eq.flagged,status.eq.flagged_followup');
          dataQuery = dataQuery.or('status.eq.flagged,status.eq.flagged_followup');
        } else {
          countQuery = countQuery.eq('status', filters.status);
          dataQuery = dataQuery.eq('status', filters.status);
        }
      }
      
      // 2. Order number filtering (simple text column)
      if (filters.orderNo) {
        countQuery = countQuery.ilike('order_no', `%${filters.orderNo}%`);
        dataQuery = dataQuery.ilike('order_no', `%${filters.orderNo}%`);
      }
      
      // 3. Date range filtering - needs special handling
      if (filters.dateRange && filters.dateRange.from) {
        // We look for the service_date in the search response JSON 
        // Using Postgres JSONB operators to filter by date
        countQuery = countQuery.gte('search_response->data->date', filters.dateRange.from.toISOString().split('T')[0]);
        dataQuery = dataQuery.gte('search_response->data->date', filters.dateRange.from.toISOString().split('T')[0]);
      }
      
      if (filters.dateRange && filters.dateRange.to) {
        // We need to add a day to the end date to include that day (inclusive range)
        const toDate = new Date(filters.dateRange.to);
        toDate.setDate(toDate.getDate() + 1);
        countQuery = countQuery.lt('search_response->data->date', toDate.toISOString().split('T')[0]);
        dataQuery = dataQuery.lt('search_response->data->date', toDate.toISOString().split('T')[0]);
      }
      
      // 4. Driver filtering with JSONB
      if (filters.driver) {
        // Driver name is in the JSON, we need to use JSON path operators
        // We're using text_search to search for the driver name within the JSON
        countQuery = countQuery.textSearch('search_response', filters.driver, { config: 'english' });
        dataQuery = dataQuery.textSearch('search_response', filters.driver, { config: 'english' });
      }
      
      // 5. Location filtering with JSONB
      if (filters.location) {
        // Location name is in the JSON, we need to use JSON path operators
        // We're using text_search to search for the location name within the JSON
        countQuery = countQuery.textSearch('search_response', filters.location, { config: 'english' });
        dataQuery = dataQuery.textSearch('search_response', filters.location, { config: 'english' });
      }
      
      // Execute the count query to get total filtered records
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error("Error fetching count:", countError);
        throw countError;
      }
      
      // Apply sorting to data query
      if (sortField && sortDirection) {
        if (sortField === 'order_no' || sortField === 'status') {
          // Direct column sort
          dataQuery = dataQuery.order(sortField, { ascending: sortDirection === 'asc' });
        } 
        else if (sortField === 'service_date') {
          // Sort by date in the JSON
          dataQuery = dataQuery.order('search_response->data->date', { ascending: sortDirection === 'asc' });
        }
        else {
          // Default fallback to timestamp sorting
          dataQuery = dataQuery.order('timestamp', { ascending: sortDirection === 'asc' });
        }
      } else {
        // Default sort if no criteria specified
        dataQuery = dataQuery.order('timestamp', { ascending: false });
      }
      
      // Apply pagination to data query
      dataQuery = dataQuery.range(from, to);
      
      // Execute the data query
      const { data, error } = await dataQuery;
      
      if (error) {
        console.error("Error fetching work orders:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length} work orders out of ${count} total matching records`);
      
      // Transform to proper WorkOrder objects
      const transformedOrders = data.map(transformWorkOrderData);
      
      // Since we've moved all filtering to the database level,
      // We'll only do additional filtering here for edge cases
      // that Postgres can't handle well
      
      // Apply additional client-side filtering if needed
      let filteredData = transformedOrders;
      
      // Return both the data and total count for pagination
      return {
        data: filteredData,
        total: count || 0
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
    gcTime: 600000
  });
};
