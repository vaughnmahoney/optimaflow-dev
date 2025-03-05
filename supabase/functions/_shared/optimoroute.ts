
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
 * Extract order numbers from search results but only for orders with specific statuses
 * This optimizes API calls by only requesting completion details for relevant orders
 */
export function extractFilteredOrderNumbers(orders: any[], validStatuses: string[] = ['success', 'failed', 'rejected']): string[] {
  if (!orders || orders.length === 0) {
    return [];
  }
  
  console.log(`Filtering orders by status: ${validStatuses.join(', ')}`);
  
  const filteredOrders = orders.filter(order => {
    // First check if order has the necessary data structure
    if (!order.data || !order.data.orderNo) {
      return false;
    }
    
    // Then check if status is in the valid statuses list
    // Status can be in different locations depending on the API response structure
    const status = order.data.status || 
                  order.scheduleInformation?.status || 
                  order.status;
    
    return status && validStatuses.includes(status);
  });
  
  console.log(`Filtered ${orders.length} orders down to ${filteredOrders.length} orders with valid statuses`);
  
  return filteredOrders.map(order => order.data.orderNo);
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
