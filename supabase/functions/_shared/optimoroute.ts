
// Shared OptimoRoute API utilities

export const baseUrl = 'https://api.optimoroute.com/v1';

export const endpoints = {
  search: '/search_orders',
  completion: '/get_completion_details'
};

/**
 * Extract order numbers from search results for use in completion API
 */
export function extractOrderNumbers(orders: any[]): string[] {
  if (!orders || orders.length === 0) {
    return [];
  }
  
  return orders
    .filter(order => order.orderNo)
    .map(order => order.orderNo);
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
    const orderNo = order.orderNo;
    const completionDetails = orderNo ? completionMap[orderNo] : null;
    
    return {
      ...order,
      completionDetails,
      completion_response: completionDetails ? { success: true, orders: [completionDetails] } : null,
      completion_status: completionDetails?.data?.status || null
    };
  });
}
