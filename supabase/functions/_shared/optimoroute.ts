
// Shared utility functions for OptimoRoute API interactions

// API constants
export const baseUrl = 'https://api.optimoroute.com/v1';
export const endpoints = {
  search: '/search_orders',
  completion: '/get_completion_details'
};

// Error handling utilities
export const API_ERROR_CODES = {
  400: 'Invalid request parameters',
  401: 'Authentication failed',
  403: 'API key lacks permission',
  404: 'Order not found',
  429: 'Rate limit exceeded',
  500: 'OptimoRoute server error'
};

// Extracts order numbers from search orders response
export function extractOrderNumbers(orders) {
  if (!orders || !Array.isArray(orders)) return [];
  
  return orders
    .filter(order => order?.data?.orderNo) // Make sure orderNo exists
    .map(order => ({ orderNo: order.data.orderNo }));
}

// Creates a map for quick completion lookups
export function createCompletionMap(completionData) {
  const completionMap = new Map();
  
  if (completionData && completionData.success && completionData.orders) {
    completionData.orders.forEach(orderCompletion => {
      if (orderCompletion.orderNo) {
        completionMap.set(orderCompletion.orderNo, orderCompletion);
      }
    });
  }
  
  return completionMap;
}

// Combines search results with completion details
export function mergeOrderData(searchOrders, completionMap) {
  if (!searchOrders || !Array.isArray(searchOrders)) return [];
  
  return searchOrders.map(searchOrder => {
    const orderNo = searchOrder.data?.orderNo;
    const completionInfo = orderNo ? completionMap.get(orderNo) : null;
    
    return {
      ...searchOrder,
      completionDetails: completionInfo || null
    };
  });
}
