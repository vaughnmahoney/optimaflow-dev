
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
 * Makes the API call to fetch orders based on the active tab
 */
export const fetchOrders = async ({
  startDate,
  endDate,
  activeTab,
  afterTag,
  previousOrders = [],
  validStatuses = ['success', 'failed', 'rejected']
}: FetchOrdersParams): Promise<{
  data: BulkOrdersResponse | null;
  error: string | null;
}> => {
  try {
    if (!startDate || !endDate) {
      return { data: null, error: "Please select both start and end dates" };
    }

    // Format dates as ISO strings
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");

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
    
    if (afterTag) {
      console.log(`Continuing with afterTag/after_tag: ${afterTag}`);
      console.log(`Previously collected orders: ${previousOrders.length}`);
    }

    // Call the selected edge function with pagination support
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        enablePagination: true,
        afterTag: afterTag,
        allCollectedOrders: previousOrders,
        validStatuses: validStatuses
      }
    });

    if (error) {
      console.error(`Error fetching orders:`, error);
      return { data: null, error: error.message };
    }

    console.log("API response:", data);
    return { data, error: null };
  } catch (error) {
    console.error("Exception fetching orders:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
