
import { toast } from "sonner";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";

interface HandleResponseParams {
  data: any;
  activeTab: string;
  previousOrders: any[];
  setShouldContinueFetching: (value: boolean) => void;
}

/**
 * Processes the API response and determines next steps
 */
export const handleOrdersResponse = ({
  data,
  activeTab,
  previousOrders,
  setShouldContinueFetching
}: HandleResponseParams): {
  updatedResponse: BulkOrdersResponse;
  collectedOrders: any[];
  shouldContinue: boolean;
} => {
  // Handle orders based on the active tab and completion status
  let filteredOrders = data.orders || [];
  let filteredCount = 0;
  
  if (activeTab === "with-completion" && Array.isArray(data.orders)) {
    // Enhanced filtering logic based on API structure
    filteredOrders = data.orders.filter(order => {
      // Check if the order has a valid completionDetails section
      return (
        order.completionDetails && 
        order.completionDetails.success === true &&
        order.completionDetails.data && 
        (
          // Include orders with "success" status
          order.completionDetails.data.status === "success" ||
          // Also include orders with "failed" status but with details
          order.completionDetails.data.status === "failed" 
        ) &&
        // Ensure it has start and end times (was actually attempted)
        order.completionDetails.data.startTime &&
        order.completionDetails.data.endTime
      );
    });
    
    filteredCount = filteredOrders.length;
    console.log(`Filtered ${filteredCount} completed orders (both success and failed statuses)`);
    
    // Log the first few orders for debugging
    if (filteredOrders.length > 0) {
      console.log("First completed order sample:", {
        id: filteredOrders[0].id,
        status: filteredOrders[0].completionDetails?.data?.status,
        hasTrackingUrl: !!filteredOrders[0].completionDetails?.data?.tracking_url
      });
    }
  }
  
  // Add specific messaging if API returned success:false
  if (data.searchResponse && data.searchResponse.success === false) {
    toast.warning(`Search API returned: ${data.searchResponse.code || 'Unknown error'} - ${data.searchResponse.message || ''}`);
    setShouldContinueFetching(false);
  } else if (data.completionResponse && data.completionResponse.success === false) {
    toast.warning(`Completion API returned: ${data.completionResponse.code || 'Unknown error'} - ${data.completionResponse.message || ''}`);
    setShouldContinueFetching(false);
  }
  
  // Check if we need to continue fetching 
  const hasContinuation = !!(data.after_tag || 
                          (data.paginationProgress?.afterTag && !data.paginationProgress?.isComplete));
  
  let shouldContinue = false;
  if (hasContinuation) {
    console.log(`More pages available. after_tag: ${data.after_tag || data.paginationProgress?.afterTag}`);
    shouldContinue = true;
  } else {
    console.log("Final page reached or pagination complete");
    
    // Display success message
    if (activeTab === "with-completion") {
      toast.success(`Retrieved ${filteredCount} completed orders out of ${data.totalCount || 0} total orders`);
    } else {
      toast.success(`Retrieved ${data.totalCount || 0} orders`);
    }
  }
  
  // Set the filtered response
  const updatedResponse = {
    ...data,
    orders: activeTab === "with-completion" ? filteredOrders : data.orders,
    filteredCount: filteredCount,
  };
  
  return {
    updatedResponse,
    collectedOrders: previousOrders.length > 0 ? [...previousOrders, ...filteredOrders] : filteredOrders,
    shouldContinue
  };
};

/**
 * Handles API errors
 */
export const handleOrdersError = (error: string): BulkOrdersResponse => {
  toast.error(`Error: ${error}`);
  return { error };
};
