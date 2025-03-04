
import { toast } from "sonner";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";
import { logApiResponseStructure, logFilterDetails } from "@/components/bulk-orders/utils/transformLoggers";

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
  console.log("Processing API response:", {
    hasOrders: !!data.orders,
    ordersCount: data.orders?.length || 0,
    totalCount: data.totalCount,
    activeTab,
    previousOrdersCount: previousOrders.length,
    paginationProgress: data.paginationProgress
  });
  
  // Add deeper debugging for raw data structure
  if (data.orders && data.orders.length > 0) {
    const firstOrder = data.orders[0];
    console.log("RAW FIRST ORDER STRUCTURE:", JSON.stringify(firstOrder, null, 2));
    console.log("First order keys at root level:", Object.keys(firstOrder));
    
    // Look for possible completion details location
    if (firstOrder.completionDetails) {
      console.log("completionDetails exists directly on order");
    } else if (firstOrder.completion_details) {
      console.log("completion_details (snake_case) exists directly on order");
    } else {
      console.log("No direct completion details found, scanning for likely fields...");
      Object.keys(firstOrder).forEach(key => {
        if (typeof firstOrder[key] === 'object' && firstOrder[key] !== null) {
          console.log(`Checking object field "${key}", keys:`, Object.keys(firstOrder[key]));
        }
      });
    }
  }
  
  // Log detailed API response structure for debugging
  logApiResponseStructure(data);
  
  // Handle orders based on the active tab and completion status
  let filteredOrders = data.orders || [];
  let filteredCount = 0;
  
  if (activeTab === "with-completion" && Array.isArray(data.orders)) {
    console.log("FILTER DEBUG - Starting filtering with", data.orders.length, "orders");
    
    // Sample some orders before filtering
    if (data.orders.length > 0) {
      console.log("FILTER DEBUG - Sample orders before filtering:", data.orders.slice(0, 3).map(order => ({
        id: order.id,
        orderNo: order.order_no || order.orderNo,
        hasCompletionDetails: !!order.completionDetails,
        hasCompletionResponse: !!order.completion_response, // Check snake_case version too
        completionSuccess: order.completionDetails?.success || order.completion_response?.success,
        hasCompletionData: !!order.completionDetails?.data || !!order.completion_response?.orders?.[0]?.data,
        completionStatus: order.completionDetails?.data?.status || 
                        order.completion_response?.orders?.[0]?.data?.status ||
                        order.completionDetails?.orders?.[0]?.data?.status,
        hasStartTime: !!order.completionDetails?.data?.startTime || 
                    !!order.completion_response?.orders?.[0]?.data?.startTime ||
                    !!order.completionDetails?.orders?.[0]?.data?.startTime,
        hasEndTime: !!order.completionDetails?.data?.endTime || 
                  !!order.completion_response?.orders?.[0]?.data?.endTime ||
                  !!order.completionDetails?.orders?.[0]?.data?.endTime,
      })));
      
      // Log raw data structure for one order for debugging
      console.log("FILTER DEBUG - FIRST ORDER RAW STRUCTURE:", JSON.stringify({
        keys: Object.keys(data.orders[0]),
        completionDetailsKeys: data.orders[0].completionDetails ? Object.keys(data.orders[0].completionDetails) : [],
        completionResponseKeys: data.orders[0].completion_response ? Object.keys(data.orders[0].completion_response) : [],
        completionDataKeys: data.orders[0].completionDetails?.data ? Object.keys(data.orders[0].completionDetails.data) : 
                          data.orders[0].completion_response?.orders?.[0]?.data ? Object.keys(data.orders[0].completion_response.orders[0].data) : []
      }, null, 2));
    }
    
    // Enhanced filtering logic with detailed failure tracking and more flexible property paths
    let failedCheckCount = {
      noCompletionDetails: 0,
      completionNotSuccess: 0,
      noCompletionData: 0,
      invalidStatus: 0,
      noStartOrEndTime: 0,
      scheduledStatus: 0,
      passedAllChecks: 0
    };
    
    filteredOrders = data.orders.filter(order => {
      // Track completionDetails in either camelCase or snake_case
      const completionDetails = order.completionDetails || order.completion_response;
      
      // Check if has any kind of completion details
      if (!completionDetails) {
        failedCheckCount.noCompletionDetails++;
        logFilterDetails(order, false, "No completion details");
        return false;
      }
      
      // Look for completion data in different possible locations 
      let completionData = null;
      
      // Direct data property
      if (completionDetails.data) {
        completionData = completionDetails.data;
      } 
      // Through orders array (first item)
      else if (completionDetails.orders && completionDetails.orders.length > 0 && completionDetails.orders[0].data) {
        completionData = completionDetails.orders[0].data;
      }
      
      // Check if completion response was successful (any structure)
      if (completionDetails.success !== true) {
        failedCheckCount.completionNotSuccess++;
        logFilterDetails(order, false, "Completion not successful");
        return false;
      }
      
      // Check if has completion data in any format
      if (!completionData) {
        failedCheckCount.noCompletionData++;
        logFilterDetails(order, false, "No completion data");
        return false;
      }
      
      // Get the status
      const status = completionData.status;
      console.log(`Order ${order.order_no || order.id} status: ${status}`);
      
      // Special case: if status is "scheduled", this is not a completed order yet
      if (status === "scheduled") {
        failedCheckCount.scheduledStatus++;
        logFilterDetails(order, false, "Status is 'scheduled' (not completed)");
        return false;
      }
      
      // Check for valid status (success or failed)
      const hasValidStatus = status === "success" || status === "failed";
      if (!hasValidStatus) {
        failedCheckCount.invalidStatus++;
        logFilterDetails(order, false, "Invalid completion status: " + status);
        return false;
      }
      
      // For completed orders (success or failed), we need start and end times
      const hasStartTime = !!completionData.startTime || !!completionData.start_time;
      const hasEndTime = !!completionData.endTime || !!completionData.end_time;
      const hasStartAndEndTimes = hasStartTime && hasEndTime;
      
      if (!hasStartAndEndTimes) {
        failedCheckCount.noStartOrEndTime++;
        logFilterDetails(order, false, "Missing start or end time for completed order");
        return false;
      }
      
      // All checks passed - this is a valid completed order (success or failed)
      failedCheckCount.passedAllChecks++;
      return true;
    });
    
    filteredCount = filteredOrders.length;
    console.log(`FILTER DEBUG - Filtered ${filteredCount} completed orders out of ${data.orders.length}`);
    console.log("FILTER DEBUG - Filter results breakdown:", failedCheckCount);
    
    // Log the first few filtered orders for debugging
    if (filteredOrders.length > 0) {
      console.log("FILTER DEBUG - First few filtered orders:", filteredOrders.slice(0, 3).map(order => ({
        id: order.id,
        orderNo: order.order_no || order.orderNo,
        status: order.completionDetails?.data?.status || 
                order.completion_response?.orders?.[0]?.data?.status ||
                order.completionDetails?.orders?.[0]?.data?.status,
        hasStartTime: !!order.completionDetails?.data?.startTime || 
                    !!order.completion_response?.orders?.[0]?.data?.startTime ||
                    !!order.completionDetails?.orders?.[0]?.data?.startTime,
        hasEndTime: !!order.completionDetails?.data?.endTime || 
                  !!order.completion_response?.orders?.[0]?.data?.endTime ||
                  !!order.completionDetails?.orders?.[0]?.data?.endTime
      })));
    } else {
      console.log("FILTER DEBUG - No orders passed the completion filters");
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
  
  // Deduplicate collected orders by order_no
  let mergedOrders: any[] = [];
  
  if (previousOrders.length > 0) {
    // Create a map to deduplicate orders by order_no
    const orderMap = new Map();
    
    // Add previous orders to the map
    previousOrders.forEach(order => {
      const orderNo = order.order_no || order.orderNo;
      if (orderNo) {
        orderMap.set(orderNo, order);
      } else if (order.id) {
        // Fallback to using ID if no order number exists
        orderMap.set(order.id, order);
      }
    });
    
    // Add or update with new orders
    filteredOrders.forEach(order => {
      const orderNo = order.order_no || order.orderNo;
      if (orderNo) {
        orderMap.set(orderNo, order);
      } else if (order.id) {
        // Fallback to using ID if no order number exists
        orderMap.set(order.id, order);
      }
    });
    
    // Convert the map back to an array
    mergedOrders = Array.from(orderMap.values());
    console.log(`Deduplicated client-side: ${previousOrders.length} + ${filteredOrders.length} = ${mergedOrders.length} unique orders`);
  } else {
    mergedOrders = filteredOrders;
  }
  
  return {
    updatedResponse,
    collectedOrders: mergedOrders,
    shouldContinue
  };
};

/**
 * Handles API errors
 */
export const handleOrdersError = (error: string): BulkOrdersResponse => {
  console.error(`Error handling order response: ${error}`);
  toast.error(`Error: ${error}`);
  return { error };
};
