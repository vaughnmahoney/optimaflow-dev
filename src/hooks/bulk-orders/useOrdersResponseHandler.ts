
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
  
  // Log detailed API response structure for debugging
  logApiResponseStructure(data);
  
  // Handle orders based on the active tab and completion status
  let filteredOrders = data.orders || [];
  let filteredCount = 0;
  
  if (activeTab === "with-completion" && Array.isArray(data.orders)) {
    console.log("FILTER DEBUG - Sample orders before filtering:", data.orders.slice(0, 3).map(order => ({
      id: order.id,
      orderNo: order.order_no,
      hasCompletionDetails: !!order.completionDetails,
      completionSuccess: order.completionDetails?.success,
      hasCompletionData: !!order.completionDetails?.data,
      completionStatus: order.completionDetails?.data?.status,
      hasStartTime: !!order.completionDetails?.data?.startTime,
      hasEndTime: !!order.completionDetails?.data?.endTime,
    })));
    
    // Log raw data structure for debugging
    if (data.orders.length > 0) {
      console.log("FIRST ORDER RAW STRUCTURE:", JSON.stringify({
        keys: Object.keys(data.orders[0]),
        completionDetailsKeys: data.orders[0].completionDetails ? Object.keys(data.orders[0].completionDetails) : [],
        completionDataKeys: data.orders[0].completionDetails?.data ? Object.keys(data.orders[0].completionDetails.data) : []
      }, null, 2));
    }
    
    // Enhanced filtering logic based on API structure
    let failedCheckCount = {
      noCompletionDetails: 0,
      completionNotSuccess: 0,
      noCompletionData: 0,
      invalidStatus: 0,
      noStartOrEndTime: 0
    };
    
    filteredOrders = data.orders.filter(order => {
      // Check if has completion details
      if (!order.completionDetails) {
        failedCheckCount.noCompletionDetails++;
        logFilterDetails(order, false, "No completion details");
        return false;
      }
      
      // Check if completion was successful
      if (order.completionDetails.success !== true) {
        failedCheckCount.completionNotSuccess++;
        logFilterDetails(order, false, "Completion not successful");
        return false;
      }
      
      // Check if has completion data
      if (!order.completionDetails.data) {
        failedCheckCount.noCompletionData++;
        logFilterDetails(order, false, "No completion data");
        return false;
      }
      
      // Check status
      const hasValidStatus = (
        order.completionDetails.data.status === "success" ||
        order.completionDetails.data.status === "failed"
      );
      if (!hasValidStatus) {
        failedCheckCount.invalidStatus++;
        logFilterDetails(order, false, "Invalid completion status");
        return false;
      }
      
      // Check start and end times
      const hasStartAndEndTimes = (
        order.completionDetails.data.startTime &&
        order.completionDetails.data.endTime
      );
      if (!hasStartAndEndTimes) {
        failedCheckCount.noStartOrEndTime++;
        logFilterDetails(order, false, "Missing start or end time");
        return false;
      }
      
      return true;
    });
    
    filteredCount = filteredOrders.length;
    console.log(`Filtered ${filteredCount} completed orders (both success and failed statuses)`);
    console.log("FILTER DEBUG - Failed checks:", failedCheckCount);
    
    // Log the first few orders for debugging
    if (filteredOrders.length > 0) {
      console.log("FILTER DEBUG - First completed order sample:", {
        id: filteredOrders[0].id,
        status: filteredOrders[0].completionDetails?.data?.status,
        hasTrackingUrl: !!filteredOrders[0].completionDetails?.data?.tracking_url,
        startTime: filteredOrders[0].completionDetails?.data?.startTime,
        endTime: filteredOrders[0].completionDetails?.data?.endTime,
        rawData: JSON.stringify(filteredOrders[0], null, 2)
      });
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
      if (order.order_no) {
        orderMap.set(order.order_no, order);
      }
    });
    
    // Add or update with new orders
    filteredOrders.forEach(order => {
      if (order.order_no) {
        orderMap.set(order.order_no, order);
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
