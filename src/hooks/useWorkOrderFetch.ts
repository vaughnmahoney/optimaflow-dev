
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderFilters } from "@/components/workorders/types";
import { transformWorkOrderData } from "@/utils/workOrderUtils";

/**
 * Helper function to get the date value for sorting from a work order
 */
const getServiceDateValue = (order: WorkOrder): Date | null => {
  // Try to get the end date from completion data first
  const endTime = order.completion_response?.orders?.[0]?.data?.endTime?.localTime;
  
  if (endTime) {
    try {
      const date = new Date(endTime);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If date parsing fails, continue to fallback
    }
  }
  
  // Fall back to service_date if end date is not available or invalid
  if (order.service_date) {
    try {
      const date = new Date(order.service_date);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, return null
    }
  }
  
  return null;
};

/**
 * Hook to fetch work orders from Supabase with client-side pagination and filtering
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
      // Build the database query with only database-level filters
      let dataQuery = supabase
        .from("work_orders")
        .select("*");
      
      // Apply database-level filters
      if (filters.status) {
        if (filters.status === 'flagged') {
          dataQuery = dataQuery.or('status.eq.flagged,status.eq.flagged_followup');
        } else {
          dataQuery = dataQuery.eq('status', filters.status);
        }
      }
      
      if (filters.orderNo) {
        dataQuery = dataQuery.ilike('order_no', `%${filters.orderNo}%`);
      }
      
      // Apply default sorting at database level 
      // (this ensures consistent results for pagination)
      dataQuery = dataQuery.order("timestamp", { ascending: false });
      
      // Fetch all matching records (limit to a reasonable amount to prevent performance issues)
      const { data, error, count } = await dataQuery.limit(1000);

      if (error) throw error;

      console.log("Fetched work orders from database:", data?.length);

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
          // Get the date using our helper function
          const orderDate = getServiceDateValue(order);
          if (!orderDate) return false;
          
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
      
      // Apply client-side sorting
      if (sortField && sortDirection) {
        filteredData.sort((a, b) => {
          let valueA: any;
          let valueB: any;
          
          if (sortField === 'service_date') {
            // Use our helper function to get dates for sorting
            const dateA = getServiceDateValue(a);
            const dateB = getServiceDateValue(b);
            
            // Handle invalid dates
            const validA = dateA !== null;
            const validB = dateB !== null;
            
            // If one date is valid and the other isn't, the valid one comes first
            if (validA && !validB) return sortDirection === 'asc' ? -1 : 1;
            if (!validA && validB) return sortDirection === 'asc' ? 1 : -1;
            // If both are invalid, they're considered equal
            if (!validA && !validB) return 0;
            
            return sortDirection === 'asc' ? dateA!.getTime() - dateB!.getTime() : dateB!.getTime() - dateA!.getTime();
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
          else {
            // Handle simple field sorting
            valueA = a[sortField as keyof WorkOrder] || '';
            valueB = b[sortField as keyof WorkOrder] || '';
          }
          
          // For string comparisons
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sortDirection === 'asc' 
              ? valueA.localeCompare(valueB) 
              : valueB.localeCompare(valueA);
          }
          
          // For other types
          return sortDirection === 'asc' 
            ? (valueA > valueB ? 1 : -1)
            : (valueB > valueA ? 1 : -1);
        });
      }
      
      // Calculate total filtered records for pagination
      const totalFilteredCount = filteredData.length;
      
      // Apply client-side pagination after all filtering and sorting
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      console.log("After client-side filtering:", filteredData.length);
      console.log("After pagination:", paginatedData.length, "Page:", page, "PageSize:", pageSize);
      
      return {
        data: paginatedData,
        total: totalFilteredCount
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
    gcTime: 600000
  });
};
