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
      
      // Apply column-specific filters that operate on actual database columns
      if (filters.orderNo) {
        query = query.ilike('order_no', `%${filters.orderNo}%`);
      }
      
      // Apply sorting if provided and it's a direct database column (not driver, location, or service_date)
      if (sortField && sortDirection && 
          !['service_date', 'driver', 'location'].includes(sortField)) {
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
      
      // Apply client-side filtering for fields stored within JSON
      let filteredData = transformedOrders;
      
      // Filter by driver
      if (filters.driver) {
        const driverSearchTerm = filters.driver.toLowerCase();
        filteredData = filteredData.filter(order => {
          if (!order.driver) return false;
          const driverName = typeof order.driver === 'object' && order.driver.name
            ? order.driver.name.toLowerCase() : '';
          return driverName.includes(driverSearchTerm);
        });
      }
      
      // Filter by location
      if (filters.location) {
        const locationSearchTerm = filters.location.toLowerCase();
        filteredData = filteredData.filter(order => {
          if (!order.location) return false;
          if (typeof order.location !== 'object') return false;
          
          const locationName = (order.location.name || order.location.locationName || '').toLowerCase();
          return locationName.includes(locationSearchTerm);
        });
      }
      
      // Filter by service date (client-side since it's extracted from JSON)
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
      
      // Apply client-side sorting for non-direct database columns
      if (sortField && sortDirection) {
        if (['service_date', 'driver', 'location'].includes(sortField)) {
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
      }
      
      // Calculate total count based on the filtered data
      const filteredTotal = filteredData.length;
      
      // Implement client-side pagination for the filtered results
      const paginatedData = filteredData.slice(0, pageSize);
      
      return {
        data: paginatedData,
        total: filteredTotal
      };
    },
    placeholderData: (previousData) => previousData,
    keepPreviousData: true
  });
};
