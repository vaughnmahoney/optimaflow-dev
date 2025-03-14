
import { WorkOrder } from "@/components/workorders/types";

/**
 * Deduplicate orders based on order_no
 * @param orders Array of work orders
 * @returns Deduplicated array of work orders
 */
export const deduplicateOrders = (orders: WorkOrder[]): WorkOrder[] => {
  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    console.log("No orders to deduplicate");
    return [];
  }
  
  console.log(`Deduplicating ${orders.length} orders`);
  
  // Use a Map for efficient lookups by order_no
  const orderMap = new Map<string, WorkOrder>();
  
  // Count for logging
  let duplicateCount = 0;
  
  // Add each order to the map, using order_no as the key
  orders.forEach(order => {
    const orderNo = order.order_no;
    
    if (!orderNo) {
      console.warn(`Order with id ${order.id} has no order_no, skipping deduplication`);
      return;
    }
    
    // If this order_no already exists in the map, it's a duplicate
    if (orderMap.has(orderNo)) {
      duplicateCount++;
      
      // Get existing order
      const existingOrder = orderMap.get(orderNo)!;
      
      // Prefer completed orders over imported ones
      if (
        (order.status === 'completed' && existingOrder.status !== 'completed') ||
        (order.status === 'rejected' && existingOrder.status === 'imported')
      ) {
        console.log(`Replacing order ${orderNo} with newer version (better status)`);
        orderMap.set(orderNo, order);
      }
      // If same status, prefer the one with images
      else if (order.has_images && !existingOrder.has_images) {
        console.log(`Replacing order ${orderNo} with version that has images`);
        orderMap.set(orderNo, order);
      }
      // If timestamps are available, prefer the newer one
      else if (order.timestamp && existingOrder.timestamp) {
        const orderTime = new Date(order.timestamp).getTime();
        const existingTime = new Date(existingOrder.timestamp).getTime();
        
        if (orderTime > existingTime) {
          console.log(`Replacing order ${orderNo} with newer timestamp`);
          orderMap.set(orderNo, order);
        }
      }
    } else {
      // First time seeing this order_no
      orderMap.set(orderNo, order);
    }
  });
  
  // Convert the map values back to an array
  const deduplicated = Array.from(orderMap.values());
  
  console.log(`Deduplication complete: ${orders.length} input orders, ${deduplicated.length} unique orders (${duplicateCount} duplicates removed)`);
  
  return deduplicated;
};

/**
 * Merge new orders with existing orders, handling duplicates
 * @param existingOrders Array of existing work orders
 * @param newOrders Array of new work orders
 * @returns Merged and deduplicated array of work orders
 */
export const mergeOrders = (existingOrders: WorkOrder[], newOrders: WorkOrder[]): WorkOrder[] => {
  console.log(`Merging ${existingOrders.length} existing orders with ${newOrders.length} new orders`);
  
  // Combine existing and new orders
  const combinedOrders = [...existingOrders, ...newOrders];
  
  // Deduplicate the combined array
  return deduplicateOrders(combinedOrders);
};
