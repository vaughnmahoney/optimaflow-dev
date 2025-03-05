
// Shared OptimoRoute API utilities

export const baseUrl = 'https://api.optimoroute.com/v1';

export const endpoints = {
  search: '/search_orders',
  completion: '/get_completion_details'
};

/**
 * Extract order numbers from search results for use in completion API
 * The OptimoRoute API nests orderNo under the data property
 */
export function extractOrderNumbers(orders: any[]): string[] {
  if (!orders || orders.length === 0) {
    return [];
  }
  
  return orders
    .filter(order => {
      // Check if orderNo exists in data property (correct structure from API)
      return order.data && order.data.orderNo;
    })
    .map(order => order.data.orderNo);
}

/**
 * Do not filter by status at this stage - pass all orders to completion API
 */
export function extractFilteredOrderNumbers(orders: any[]): string[] {
  console.log(`Extracting order numbers without status filtering from ${orders?.length || 0} orders`);
  return extractOrderNumbers(orders);
}

/**
 * Create a map of orderNo to completion details for faster lookups
 */
export function createCompletionMap(completionData: any): Record<string, any> {
  if (!completionData || !completionData.orders || !Array.isArray(completionData.orders)) {
    return {};
  }
  
  const map: Record<string, any> = {};
  
  completionData.orders.forEach((order: any) => {
    if (order.orderNo) {
      map[order.orderNo] = order;
    }
  });
  
  return map;
}

/**
 * Merge search results with completion details
 */
export function mergeOrderData(orders: any[], completionMap: Record<string, any>): any[] {
  if (!orders || orders.length === 0) {
    return [];
  }
  
  return orders.map(order => {
    // Get orderNo from the correct location (inside data object)
    const orderNo = order.data?.orderNo;
    const completionDetails = orderNo ? completionMap[orderNo] : null;
    
    return {
      ...order,
      completionDetails,
      completion_response: completionDetails ? { success: true, orders: [completionDetails] } : null,
      completion_status: completionDetails?.data?.status || null
    };
  });
}

/**
 * Filter orders by completion status
 * This function is used to filter orders on the backend before sending to frontend
 */
export function filterOrdersByStatus(orders: any[], validStatuses: string[] = ['success', 'failed', 'rejected']): any[] {
  if (!orders || !Array.isArray(orders)) {
    console.log("No orders to filter by status");
    return [];
  }
  
  console.log(`Filtering ${orders.length} orders by status, valid statuses: ${validStatuses.join(', ')}`);
  
  // Track filtration statistics for logging
  const stats = {
    noCompletionData: 0,
    invalidStatus: 0,
    passed: 0
  };
  
  const filteredOrders = orders.filter(order => {
    // Check if the order has completion data
    if (!order.completion_response || !order.completionDetails || !order.completionDetails.data) {
      stats.noCompletionData++;
      return false;
    }
    
    // Get the status from the appropriate location
    const status = order.completion_status || 
                  order.completionDetails.data.status || 
                  order.completionDetails.status;
    
    // If no status found, filter out
    if (!status) {
      stats.invalidStatus++;
      return false;
    }
    
    // Check if the status is in the valid statuses list
    const isValidStatus = validStatuses.includes(status);
    
    if (isValidStatus) {
      stats.passed++;
    } else {
      stats.invalidStatus++;
    }
    
    return isValidStatus;
  });
  
  console.log(`Status filtering complete: ${orders.length} input orders, ${filteredOrders.length} filtered orders`);
  console.log(`Status filtering stats: ${stats.passed} passed, ${stats.noCompletionData} no completion data, ${stats.invalidStatus} invalid status`);
  
  return filteredOrders;
}
