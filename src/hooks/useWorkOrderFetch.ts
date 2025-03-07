
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
      
      // We need to fetch all records for client-side filtering, but with pagination
      // First, get the total count without pagination
      const countQuery = supabase
        .from("work_orders")
        .select("id", { count: "exact", head: true });
      
      // Apply database-level filters to count query
      if (filters.status) {
        if (filters.status === 'flagged') {
          countQuery.or('status.eq.flagged,status.eq.flagged_followup');
        } else {
          countQuery.eq('status', filters.status);
        }
      }
      
      if (filters.orderNo) {
        countQuery.ilike('order_no', `%${filters.orderNo}%`);
      }
      
      // Get the total count of all records matching the database-level filters
      const { count: totalDBCount, error: countError } = await countQuery;
      
      if (countError) {
        console.error("Error fetching count:", countError);
        throw countError;
      }
      
      // Start building the query for the current page data
      let dataQuery = supabase
        .from("work_orders")
        .select("*");
      
      // Apply database-level filters to data query
      if (filters.status) {
        if (filters.status === 'flagged') {
          dataQuery = dataQuery.or('status.eq.flagged,status.eq.flagged_followup');
        } else {
          dataQuery = dataQuery.eq('status', filters.status);
        }
      }
      
      // Apply column-specific filters that operate on actual database columns
      if (filters.orderNo) {
        dataQuery = dataQuery.ilike('order_no', `%${filters.orderNo}%`);
      }
      
      // Apply sorting if provided and it's a direct database column
      if (sortField && sortDirection && 
          !['service_date', 'driver', 'location'].includes(sortField)) {
        dataQuery = dataQuery.order(sortField, { ascending: sortDirection === 'asc' });
      } else {
        // Default sort by timestamp
        dataQuery = dataQuery.order("timestamp", { ascending: false });
      }
      
      // Execute the query with pagination
      const { data, error } = await dataQuery.range(from, to);

      if (error) throw error;

      console.log("Fetched work orders:", data?.length, "Total count:", totalDBCount);

      // Transform all data to proper WorkOrder objects
      const transformedOrders = data.map(transformWorkOrderData);
      
      // Apply client-side filtering for fields stored within JSON
      let filteredData = transformedOrders;
      
      // Client-side filters for JSON fields
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
      
      if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
        filteredData = filteredData.filter(order => {
          if (!order.service_date) return false;
          
          const orderDate = new Date(order.service_date);
          
          // Check if orderDate is valid
          if (isNaN(orderDate.getTime())) return false;
          
          // Check "from" date if specified
          if (filters.dateRange.from) {
            const fromDate = new Date(filters.dateRange.from);
            fromDate.setHours(0, 0, 0, 0);
            
            if (orderDate < fromDate) return false;
          }
          
          // Check "to" date if specified
          if (filters.dateRange.to) {
            const toDate = new Date(filters.dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            
            if (orderDate > toDate) return false;
          }
          
          return true;
        });
      }
      
      // Apply client-side sorting for special fields
      if (sortField && sortDirection && ['service_date', 'driver', 'location'].includes(sortField)) {
        filteredData.sort((a, b) => {
          let valueA: any;
          let valueB: any;
          
          if (sortField === 'service_date') {
            const dateA = a.service_date ? new Date(a.service_date).getTime() : 0;
            const dateB = b.service_date ? new Date(b.service_date).getTime() : 0;
            
            // Handle invalid dates
            const validA = !isNaN(dateA);
            const validB = !isNaN(dateB);
            
            // If one date is valid and the other isn't, the valid one comes first
            if (validA && !validB) return sortDirection === 'asc' ? -1 : 1;
            if (!validA && validB) return sortDirection === 'asc' ? 1 : -1;
            // If both are invalid, they're considered equal
            if (!validA && !validB) return 0;
            
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
          } 
          else if (sortField === 'driver') {
            // Handle driver sorting
            valueA = a.driver && typeof a.driver === 'object' && a.driver.name
              ? a.driver.name.toLowerCase() : '';
            valueB = b.driver && typeof b.driver === 'object' && b.driver.name
              ? b.driver.name.toLowerCase() : '';
          } 
          else if (sortField === 'location') {
            // Handle location sorting
            valueA = a.location && typeof a.location === 'object' 
              ? (a.location.name || a.location.locationName || '').toLowerCase() : '';
            valueB = b.location && typeof b.location === 'object'
              ? (b.location.name || b.location.locationName || '').toLowerCase() : '';
          }
          
          // For string comparisons (driver and location)
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        });
      }
      
      // The important part: Use the total count from the database for pagination
      // This ensures we show the correct number of pages based on all available records
      return {
        data: filteredData,
        total: totalDBCount || 0
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
    gcTime: 600000
  });
};
