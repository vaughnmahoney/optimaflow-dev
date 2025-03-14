
// Shared OptimoRoute API utilities

export const baseUrl = 'https://api.optimoroute.com/v1';

export const endpoints = {
  search: '/search_orders',
  completion: '/get_completion_details',
  routes: '/get_routes'
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
 * Improved version of filterOrdersByStatus that handles all possible status locations
 * and correctly handles case-insensitive comparison
 */
export function filterOrdersByStatus(orders: any[], validStatuses: string[] = ['success', 'failed', 'rejected']): any[] {
  if (!orders || !Array.isArray(orders)) {
    console.log("No orders to filter by status");
    return [];
  }
  
  // Convert valid statuses to lowercase for case-insensitive comparison
  const normalizedValidStatuses = validStatuses.map(status => status.toLowerCase());
  
  console.log(`Filtering ${orders.length} orders by status: ${normalizedValidStatuses.join(', ')}`);
  
  // Inspect a sample order to help debug status locations
  if (orders.length > 0) {
    const sample = orders[0];
    console.log("Sample order structure for status debugging:", JSON.stringify({
      hasCompletionDetails: !!sample.completionDetails,
      completionDetailsDataStatus: sample.completionDetails?.data?.status,
      completionStatus: sample.completion_status,
      extractedStatus: sample.extracted?.completionStatus,
      directDataStatus: sample.data?.status,
      completionResponseStatus: sample.completion_response?.orders?.[0]?.data?.status
    }, null, 2));
  }
  
  // Track status distribution for logging
  const statusCounts: Record<string, number> = {};
  const filteredOrders = orders.filter(order => {
    // Enhanced logic to find status in all possible locations
    let status = "unknown";
    
    // First check the most likely location based on API docs: completionDetails.data.status
    if (order.completionDetails?.data?.status) {
      status = order.completionDetails.data.status;
    } 
    // Then check other possible locations
    else if (order.completion_status) {
      status = order.completion_status;
    } 
    else if (order.extracted?.completionStatus) {
      status = order.extracted.completionStatus;
    } 
    else if (order.completion_response?.orders?.[0]?.data?.status) {
      status = order.completion_response.orders[0].data.status;
    }
    else if (order.data?.status) {
      status = order.data.status;
    }
    
    // Normalize status to lowercase for comparison
    const normalizedStatus = String(status).toLowerCase();
    
    // Count statuses for logging
    statusCounts[normalizedStatus] = (statusCounts[normalizedStatus] || 0) + 1;
    
    // Keep only orders with status in normalizedValidStatuses array
    return normalizedValidStatuses.includes(normalizedStatus);
  });
  
  console.log("Status distribution in data:", JSON.stringify(statusCounts, null, 2));
  console.log(`After filtering: ${filteredOrders.length} of ${orders.length} orders match valid statuses (${normalizedValidStatuses.join(', ')})`);
  
  return filteredOrders;
}
