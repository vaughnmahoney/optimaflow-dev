
export const baseUrl = "https://api.optimoroute.com/v1";

export const endpoints = {
  search: "/search_orders",
  completion: "/get_completion_details",
  routes: "/get_routes",
};

/**
 * Extracts order numbers from a list of orders
 * @param orders Array of orders from the API response
 * @returns Array of order numbers
 */
export const extractOrderNumbers = (orders: any[]): string[] => {
  if (!orders || orders.length === 0) {
    return [];
  }
  
  return orders
    .map(order => {
      // Check if orderNo exists in the expected data property
      return order.data?.orderNo || null;
    })
    .filter(Boolean); // Remove null/undefined values
};

/**
 * Creates a map of order numbers to completion details for faster lookups
 * @param completionData Completion details data from API
 * @returns Map of order numbers to completion details
 */
export const createCompletionMap = (completionData: any): Record<string, any> => {
  const completionMap: Record<string, any> = {};
  
  if (!completionData || !completionData.orders || !Array.isArray(completionData.orders)) {
    return completionMap;
  }
  
  completionData.orders.forEach(order => {
    if (order.data && order.data.orderNo) {
      completionMap[order.data.orderNo] = order;
    }
  });
  
  return completionMap;
};

/**
 * Merges search order data with completion details
 * @param searchOrders Array of orders from search response
 * @param completionMap Map of order numbers to completion details
 * @returns Array of merged order data
 */
export const mergeOrderData = (searchOrders: any[], completionMap: Record<string, any>): any[] => {
  if (!searchOrders || searchOrders.length === 0) {
    return [];
  }
  
  return searchOrders.map(searchOrder => {
    const orderNo = searchOrder.data?.orderNo;
    const completionDetails = orderNo ? completionMap[orderNo] : null;
    
    return {
      ...searchOrder,
      completion_details: completionDetails || null,
      completion_status: completionDetails?.data?.status || null
    };
  });
};

/**
 * Filters orders by status with improved path checking
 * @param orders Array of orders
 * @param validStatuses Array of valid statuses to include
 * @returns Filtered array of orders
 */
export const filterOrdersByStatus = (orders: any[], validStatuses: string[]): any[] => {
  if (!orders || orders.length === 0 || !validStatuses || validStatuses.length === 0) {
    return [];
  }
  
  console.log(`Filtering ${orders.length} orders by statuses: ${validStatuses.join(', ')}`);
  
  // Sample first 5 orders for debugging
  if (orders.length > 0) {
    console.log("Sample order structure:", JSON.stringify(orders[0], null, 2).substring(0, 500) + "...");
  }
  
  return orders.filter(order => {
    // Check multiple possible paths for status value in each order
    // Convert to lowercase for case-insensitive comparison
    const status = 
      // Direct status field
      (order.status?.toLowerCase()) || 
      // Check data.status (from get_completion_details)
      (order.data?.status?.toLowerCase()) || 
      // Check completion_status from merged data
      (order.completion_status?.toLowerCase()) || 
      // Check completion_details nested data
      (order.completion_details?.data?.status?.toLowerCase()) ||
      // Check extracted completionStatus 
      (order.extracted?.completionStatus?.toLowerCase()) ||
      // Check search_response scheduleInformation
      (order.search_response?.scheduleInformation?.status?.toLowerCase()) ||
      // If we can't find a status, return null
      null;
    
    // Check if the status is in our valid list (case insensitive)
    const isValid = status && validStatuses.some(
      validStatus => validStatus.toLowerCase() === status
    );
    
    return isValid;
  });
};
