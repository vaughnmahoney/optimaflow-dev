
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderFilters } from "@/components/workorders/types";
import { transformWorkOrderData } from "@/utils/workOrderUtils";
import { format } from "date-fns";

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
      
      // Apply date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        // We need to handle the dates differently for service_date filtering,
        // as service_date is stored inside the search_response JSON
        
        // For now, we'll filter on the timestamp field which is more reliable
        if (filters.dateRange.from) {
          const fromDate = format(filters.dateRange.from, 'yyyy-MM-dd');
          query = query.gte('timestamp', `${fromDate}T00:00:00`);
        }
        
        if (filters.dateRange.to) {
          const toDate = format(filters.dateRange.to, 'yyyy-MM-dd');
          query = query.lte('timestamp', `${toDate}T23:59:59`);
        }
      }
      
      // Apply driver filter - this is more complex as it's inside JSON
      if (filters.driver) {
        // Use contains operator to search inside the JSON for the driver ID
        query = query.contains('search_response', { 
          scheduleInformation: { 
            driverId: filters.driver 
          } 
        });
      }
      
      // Apply location filter - also inside JSON
      if (filters.location) {
        // For location, we'll check if the locationId or name contains the search term
        query = query.or(`search_response->data->location->locationId.eq.${filters.location},search_response->data->location->name.eq.${filters.location}`);
      }
      
      // Apply text search if provided
      if (filters.searchQuery) {
        query = query.or(
          `order_no.ilike.%${filters.searchQuery}%,search_response->data->location->name.ilike.%${filters.searchQuery}%,search_response->scheduleInformation->driverName.ilike.%${filters.searchQuery}%`
        );
      }
      
      // Apply sorting if provided
      if (sortField && sortDirection) {
        // Special handling for fields that are inside JSON
        if (sortField === 'driver') {
          // For driver sorting, we'd use a raw query but Supabase doesn't support sorting on JSONB easily
          // Fallback to ordering by timestamp
          query = query.order("timestamp", { ascending: sortDirection === 'asc' });
        } else if (sortField === 'location') {
          // Similar issue with location
          query = query.order("timestamp", { ascending: sortDirection === 'asc' });
        } else if (sortField === 'service_date') {
          // Similar issue with service_date
          query = query.order("timestamp", { ascending: sortDirection === 'asc' });
        } else {
          // For normal fields we can sort directly
          query = query.order(sortField, { ascending: sortDirection === 'asc' });
        }
      } else {
        // Default sort by timestamp
        query = query.order("timestamp", { ascending: false });
      }
      
      // Apply pagination
      query = query.range(from, to);
      
      // Execute the query
      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data.map(transformWorkOrderData),
        total: count || 0
      };
    }
  });
};
