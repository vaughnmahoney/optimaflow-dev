
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
      
      // STEP 1: Fetch total count of filtered work orders
      let countQuery = supabase
        .from("work_orders")
        .select("*", { count: 'exact', head: true });
      
      // Apply database-level filters
      countQuery = applyDatabaseFilters(countQuery, filters);
      
      // Execute the count query
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error("Error fetching count:", countError);
        throw countError;
      }
      
      const totalFilteredCount = count || 0;
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
      
      console.log(`Fetched ${paginatedData?.length || 0} records for page ${page}`);
      
      // STEP 3: Transform the data to WorkOrder objects
      const transformedOrders = (paginatedData || []).map(transformWorkOrderData);
      
      // Return the paginated data with the total count
      return {
        data: transformedOrders,
        total: totalFilteredCount
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
  
  // Filter by date range if both dates are provided
  if (filters.dateRange?.from && filters.dateRange?.to) {
    const formattedFrom = filters.dateRange.from.toISOString().split('T')[0];
    const formattedTo = filters.dateRange.to.toISOString().split('T')[0];
    query = query.gte('timestamp', `${formattedFrom}T00:00:00.000Z`);
    query = query.lte('timestamp', `${formattedTo}T23:59:59.999Z`);
  }
  // Filter by from date only
  else if (filters.dateRange?.from) {
    const formattedFrom = filters.dateRange.from.toISOString().split('T')[0];
    query = query.gte('timestamp', `${formattedFrom}T00:00:00.000Z`);
  }
  // Filter by to date only
  else if (filters.dateRange?.to) {
    const formattedTo = filters.dateRange.to.toISOString().split('T')[0];
    query = query.lte('timestamp', `${formattedTo}T23:59:59.999Z`);
  }
  
  // Filter by driver (using driver info stored in JSON)
  if (filters.driver) {
    // This assumes driver info is stored in a JSON column 
    // or can be extracted from completion_response
    query = query.ilike('search_response::text', `%${filters.driver}%`);
  }
  
  // Filter by location (using location info stored in JSON)
  if (filters.location) {
    // This assumes location info is stored in a JSON column
    // or can be extracted from search_response
    query = query.ilike('search_response::text', `%${filters.location}%`);
  }
  
  return query;
};

/**
 * Helper function to apply sorting to a query
 */
const applySorting = (query, sortField: string | null, sortDirection: string | null) => {
  // Apply database-level sorting for fields that are actual columns
  if (sortField && sortDirection) {
    if (sortField === 'order_no' || sortField === 'status') {
      // These are direct database columns
      query = query.order(sortField, { ascending: sortDirection === 'asc' });
    } else if (sortField === 'service_date') {
      // Assuming service_date is extracted from timestamp 
      query = query.order('timestamp', { ascending: sortDirection === 'asc' });
    } else {
      // Default sort by timestamp
      query = query.order('timestamp', { ascending: sortDirection === 'asc' });
    }
  } else {
    // Default sort by timestamp (created_at) descending
    query = query.order('timestamp', { ascending: false });
  }
  
  return query;
};
