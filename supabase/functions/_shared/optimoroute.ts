
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
 * Filters orders by status
 * @param orders Array of orders
 * @param validStatuses Array of valid statuses to include
 * @returns Filtered array of orders
 */
export const filterOrdersByStatus = (orders: any[], validStatuses: string[]): any[] => {
  if (!orders || orders.length === 0 || !validStatuses || validStatuses.length === 0) {
    return [];
  }
  
  return orders.filter(order => {
    const status = order.completion_status || 
                  order.completion_details?.data?.status || 
                  null;
    
    return status && validStatuses.includes(status);
  });
};
