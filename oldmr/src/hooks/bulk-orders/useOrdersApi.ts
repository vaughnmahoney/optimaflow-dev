
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatInTimeZone } from "date-fns-tz";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";

interface FetchOrdersParams {
  startDate: Date;
  endDate: Date;
  activeTab: string;
  afterTag?: string;
  previousOrders?: any[];
  validStatuses?: string[];
}

/**
 * Hook to provide API access for bulk orders
 */
export const useOrdersApi = () => {
  /**
   * Makes the API call to fetch orders based on the active tab
   * 
   * IMPORTANT: The validStatuses parameter controls which order statuses are returned.
   * OptimoRoute status values:
   * - 'success' - Order was completed successfully
   * - 'failed' - Driver failed to complete the order
   * - 'rejected' - Order was rejected by the driver
   * - 'scheduled' - Order has not been started yet
   * - 'on_route' - Driver is on their way
   * - 'servicing' - Order is being serviced
   * - 'unscheduled' - Order not scheduled
   * - 'cancelled' - Order cancelled by customer
   * 
   * For QC purposes, we typically only want: ['success', 'failed', 'rejected']
   */
  const fetchOrders = async ({
    startDate,
    endDate,
    activeTab,
    validStatuses = ['success', 'failed', 'rejected']
  }: FetchOrdersParams): Promise<{
    data: BulkOrdersResponse | null;
    error: string | null;
  }> => {
    try {
      if (!startDate || !endDate) {
        return { data: null, error: "Please select both start and end dates" };
      }

      // Format dates properly using UTC timezone to avoid timezone issues
      // This ensures that when a user selects a date like "2023-05-15", the API receives
      // exactly that date in UTC, which helps with consistent filtering across timezones
      const formattedStartDate = formatInTimeZone(startDate, 'UTC', 'yyyy-MM-dd');
      const formattedEndDate = formatInTimeZone(endDate, 'UTC', 'yyyy-MM-dd');

      let endpoint;
      let logMessage;
      
      if (activeTab === "search-only") {
        endpoint = "bulk-get-orders";
        logMessage = "Calling bulk-get-orders (search_orders only)";
      } else {
        endpoint = "get-orders-with-completion";
        logMessage = "Calling get-orders-with-completion (search_orders + get_completion_details)";
      }
      
      console.log(`${logMessage} with dates: ${formattedStartDate} to ${formattedEndDate}`);
      console.log(`UTC conversion: ${startDate.toISOString()} -> ${formattedStartDate}, ${endDate.toISOString()} -> ${formattedEndDate}`);
      console.log(`Requesting orders with statuses: ${validStatuses.join(', ')}`);

      // Log the request payload
      const requestPayload = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        validStatuses: validStatuses
      };
      console.log("API request payload:", requestPayload);

      // Call the selected edge function
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          validStatuses: validStatuses
        }
      });

      if (error) {
        console.error(`Error fetching orders:`, error);
        return { data: null, error: error.message };
      }

      // Log response metadata
      console.log("API response metadata:", {
        totalCount: data.totalCount,
        filteredCount: data.filteredCount,
        ordersInResponse: data.orders?.length || 0,
        filteringMetadata: data.filteringMetadata
      });

      // Calculate and log filtering ratio if we have the data
      if (data.filteringMetadata) {
        const { unfilteredOrderCount, filteredOrderCount } = data.filteringMetadata;
        if (unfilteredOrderCount && filteredOrderCount) {
          const filterRatio = (filteredOrderCount / unfilteredOrderCount * 100).toFixed(1);
          console.log(`Filtering ratio: ${filterRatio}% of orders passed status filtering (${filteredOrderCount}/${unfilteredOrderCount})`);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error("Exception fetching orders:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };

  return {
    fetchOrders
  };
};
