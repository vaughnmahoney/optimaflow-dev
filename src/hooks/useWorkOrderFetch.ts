
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
  sortField: string | null = 'service_date',
  sortDirection: string | null = 'desc'
) => {
  return useQuery({
    queryKey: ["workOrders", filters, page, pageSize, sortField, sortDirection],
    queryFn: async () => {
      console.log("Fetching work orders with filters:", JSON.stringify(filters));
      console.log("Page:", page, "PageSize:", pageSize);
      console.log("Sort:", sortField, sortDirection);
      
      // STEP 1: Fetch all work orders with database-level filters
      // This will be used to calculate the total count of filtered records
      let query = supabase
        .from("work_orders")
        .select("*");
      
      // Apply database-level filters
      query = applyDatabaseFilters(query, filters);
      
      // Get total filtered count from database
      const { count: totalFilteredCount, error: countError } = await query.count();
      
      if (countError) {
        console.error("Error fetching count:", countError);
        throw countError;
      }
      
      console.log("Total filtered count from database:", totalFilteredCount);
      
      // STEP 2: Fetch paginated records with the same database filters
      let paginatedQuery = supabase
        .from("work_orders")
        .select("*");
      
      // Apply the same database filters
      paginatedQuery = applyDatabaseFilters(paginatedQuery, filters);
      
      // Apply sorting at database level when possible
      paginatedQuery = applySorting(paginatedQuery, sortField, sortDirection);
      
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Apply pagination
      const { data: paginatedData, error: paginatedError } = await paginatedQuery
        .range(from, to);
      
      if (paginatedError) {
        console.error("Error fetching paginated data:", paginatedError);
        throw paginatedError;
      }
      
      console.log(`Fetched ${paginatedData.length} records for page ${page}`);
      
      // STEP 3: Transform the data to WorkOrder objects
      const transformedOrders = paginatedData.map(transformWorkOrderData);
      
      // Return the paginated data with the total count
      return {
        data: transformedOrders,
        total: totalFilteredCount || 0
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
    gcTime: 600000
  });
};

/**
 * Helper function to apply database-level filters to a query
 */
const applyDatabaseFilters = (query, filters: WorkOrderFilters) => {
  // Filter by status
  if (filters.status) {
    if (filters.status === 'flagged') {
      query = query.or('status.eq.flagged,status.eq.flagged_followup');
    } else {
      query = query.eq('status', filters.status);
    }
  }
  
  // Filter by order number
  if (filters.orderNo) {
    query = query.ilike('order_no', `%${filters.orderNo}%`);
  }
  
  // Add other database-level filters here as needed
  
  return query;
};

/**
 * Helper function to apply sorting to a query
 */
const applySorting = (query, sortField: string | null, sortDirection: string | null) => {
  // Apply database-level sorting for fields that are actual columns
  if (sortField && sortDirection && !['service_date', 'driver', 'location'].includes(sortField)) {
    query = query.order(sortField, { ascending: sortDirection === 'asc' });
  } else {
    // Default sort by timestamp (created_at) descending
    query = query.order('timestamp', { ascending: false });
  }
  
  return query;
};
