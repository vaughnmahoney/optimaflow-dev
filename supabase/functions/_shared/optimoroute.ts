
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
  
  console.log(`Created completion map with ${Object.keys(map).length} entries`);
  
  return map;
}

/**
 * Merge search results with completion details
 * Collect and log data from various locations to help with debugging
 */
export function mergeOrderData(orders: any[], completionMap: Record<string, any>): any[] {
  if (!orders || orders.length === 0) {
    return [];
  }
  
  console.log(`Merging ${orders.length} orders with completion details`);
  
  return orders.map(order => {
    // Get orderNo from the correct location (inside data object)
    const orderNo = order.data?.orderNo;
    const completionDetails = orderNo ? completionMap[orderNo] : null;
    
    // Extract key fields from different possible locations
    const extractedData = {
      orderNo: orderNo || order.orderNo || "Unknown",
      tracking_url: completionDetails?.data?.tracking_url || null,
      driverName: order.scheduleInformation?.driverName || null,
      completionStatus: completionDetails?.data?.status || null
    };
    
    return {
      ...order,
      completionDetails,
      extracted: extractedData,
      completion_response: completionDetails ? { success: true, orders: [completionDetails] } : null,
      completion_status: completionDetails?.data?.status || null
    };
  });
}

/**
 * Returns all orders without filtering by status
 */
export function filterOrdersByStatus(orders: any[], validStatuses: string[] = ['success', 'failed', 'rejected']): any[] {
  if (!orders || !Array.isArray(orders)) {
    console.log("No orders to filter by status");
    return [];
  }
  
  console.log(`RETURNING ALL ORDERS: ${orders.length} orders without status filtering`);
  console.log(`(Ignoring validStatuses: ${validStatuses.join(', ')})`);
  
  // Log status data to help with debugging
  const statusCounts: Record<string, number> = {};
  orders.forEach(order => {
    const status = order.completion_status || 
                  order.completionDetails?.data?.status || 
                  order.completionDetails?.status || 
                  "unknown";
    
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  console.log("Status distribution in data:", JSON.stringify(statusCounts, null, 2));
  
  // Return all orders without filtering
  return orders;
}
