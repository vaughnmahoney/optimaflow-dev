
import { useQuery } from "@tanstack/react-query";
import { WorkOrderFilters, SortField, SortDirection } from "@/components/workorders/types";
import {
  initializeCountQuery,
  initializeDataQuery,
  applyAllFilters,
  applySorting,
  applyPagination
} from "@/utils/workOrderQueryBuilder";
import {
  executeCountQuery,
  executeDataQuery,
  transformWorkOrderResults,
  processFilteredData
} from "@/utils/workOrderQueryExecutor";

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
      
      // Initialize queries
      let countQuery = initializeCountQuery();
      let dataQuery = initializeDataQuery();
      
      // Apply all filters to both queries
      const filteredQueries = applyAllFilters(filters, countQuery, dataQuery);
      countQuery = filteredQueries.countQuery;
      dataQuery = filteredQueries.dataQuery;
      
      // Execute the count query to get total filtered records
      const count = await executeCountQuery(countQuery);
      
      console.log(`Total matching records before sorting/pagination: ${count}`);
      
      // Apply sorting to data query
      dataQuery = applySorting(dataQuery, sortField, sortDirection);
      
      // Apply pagination to data query
      dataQuery = applyPagination(dataQuery, page, pageSize);
      
      // Execute the data query
      const data = await executeDataQuery(dataQuery);
      
      console.log(`Fetched ${data.length} work orders out of ${count} total matching records`);
      
      if (data.length > 0) {
        // Log first and last dates for debugging
        try {
          const dates = data.map(item => {
            // Try to get the most accurate date from the response
            const endTime = item.completion_response?.orders?.[0]?.data?.endTime?.localTime;
            const searchDate = item.search_response?.data?.date;
            return endTime || searchDate || item.timestamp || 'unknown date';
          });
          console.log(`Date range in this page: ${dates[0]} to ${dates[dates.length - 1]}`);
        } catch (error) {
          console.error("Error logging date debug info:", error);
        }
      }
      
      // Transform to proper WorkOrder objects
      const transformedOrders = transformWorkOrderResults(data);
      
      // Apply any additional client-side filtering if needed
      const filteredData = processFilteredData(transformedOrders);
      
      // Return both the data and total count for pagination
      return {
        data: filteredData,
        total: count
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
    gcTime: 600000
  });
};
