
export const baseUrl = "https://api.optimoroute.com/v1";

export const endpoints = {
  search: "/search_orders",
  completion: "/get_completion_details",
  routes: "/get_routes",
};

// Helper to filter orders by status
export function filterOrdersByStatus(orders: any[], validStatuses: string[] = ['success', 'failed', 'rejected']): any[] {
  if (!orders || !Array.isArray(orders)) return [];
  
  return orders.filter(order => {
    const status = order.data?.status || 'unknown';
    return validStatuses.includes(status);
  });
}
