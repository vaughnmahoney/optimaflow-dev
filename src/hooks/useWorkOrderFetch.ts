
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
import { toast } from "sonner";

/**
 * Hook to fetch work orders from Supabase with pagination and filtering
 * Uses dedicated database columns for improved filtering performance
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
      
      try {
        // Initialize queries
        let countQuery = initializeCountQuery();
        let dataQuery = initializeDataQuery();
        
        try {
          // Apply all filters to both queries
          const filteredQueries = applyAllFilters(filters, countQuery, dataQuery);
          countQuery = filteredQueries.countQuery;
          dataQuery = filteredQueries.dataQuery;
        } catch (filterError) {
          console.error("Error applying filters:", filterError);
          toast.error("Error applying filters. Some filters may not work correctly.");
          // Reset to basic queries if filters cause errors
          countQuery = initializeCountQuery();
          dataQuery = initializeDataQuery();
        }
        
        // Execute the count query to get total filtered records
        let count;
        try {
          count = await executeCountQuery(countQuery);
          console.log(`Total matching records before sorting/pagination: ${count}`);
        } catch (countError) {
          console.error("Error executing count query:", countError);
          toast.error("Error counting results. Using estimated count instead.");
          count = 0; // Default to 0 if count query fails
        }
        
        // Apply sorting to data query
        dataQuery = applySorting(dataQuery, sortField, sortDirection);
        
        // Apply pagination to data query
        dataQuery = applyPagination(dataQuery, page, pageSize);
        
        // Execute the data query
        let data;
        try {
          data = await executeDataQuery(dataQuery);
          console.log(`Fetched ${data.length} work orders out of ${count} total matching records`);
        } catch (dataError) {
          console.error("Error executing data query:", dataError);
          toast.error("Error fetching work orders. Please try again.");
          data = []; // Default to empty array if data query fails
        }
        
        if (data.length > 0) {
          // Log first and last dates for debugging
          try {
            const dates = data.map(item => item.service_date || 'unknown date');
            console.log(`Date range in this page: ${dates[0]} to ${dates[dates.length - 1]}`);
          } catch (error) {
            console.error("Error logging date debug info:", error);
          }
        }
        
        // Transform to proper WorkOrder objects
        const transformedOrders = transformWorkOrderResults(data);
        
        // Apply any additional client-side filtering if needed
        const filteredData = processFilteredData(transformedOrders);
        
        // If we got data but count failed, use data length for pagination
        if (count === 0 && data.length > 0) {
          count = data.length;
          console.log(`Using data length for count: ${count}`);
        }
        
        // Return both the data and total count for pagination
        return {
          data: filteredData,
          total: count
        };
      } catch (error) {
        console.error("Error fetching work orders:", error);
        
        // Show a toast notification to the user
        toast.error("Error loading work orders. Please try again.");
        
        // Return empty data instead of re-throwing to prevent UI breakage
        return {
          data: [],
          total: 0
        };
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
    gcTime: 600000
  });
};
