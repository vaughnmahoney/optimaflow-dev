
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
      
      // Global text search across multiple fields
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const searchTerm = filters.searchQuery.trim();
        
        // Use OR condition to search across multiple fields/columns
        query = query.or(
          `order_no.ilike.%${searchTerm}%,` +
          `qc_notes.ilike.%${searchTerm}%,` +
          `resolution_notes.ilike.%${searchTerm}%,` +
          `search_response->data->location->name.ilike.%${searchTerm}%,` +
          `search_response->data->location->locationId.ilike.%${searchTerm}%,` +
          `search_response->scheduleInformation->driverName.ilike.%${searchTerm}%,` +
          `search_response->scheduleInformation->driverId.ilike.%${searchTerm}%,` +
          `search_response->data->service->serviceDate.ilike.%${searchTerm}%`
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
