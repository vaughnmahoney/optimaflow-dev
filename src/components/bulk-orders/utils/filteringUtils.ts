
import { WorkOrder } from "@/components/workorders/types";

/**
 * Filter orders that have valid completion data
 * @param orders Array of work orders
 * @returns Filtered array of work orders with valid completion
 */
export const filterCompletedOrders = (orders: WorkOrder[]): WorkOrder[] => {
  if (!orders || !Array.isArray(orders)) {
    console.log("No orders to filter");
    return [];
  }
  
  console.log(`Filtering ${orders.length} orders for completed status`);
  
  // Track filtration statistics
  const stats = {
    noCompletionResponse: 0,
    completionNotSuccess: 0,
    invalidStatus: 0,
    scheduledStatus: 0,
    noTimeInfo: 0,
    passed: 0
  };
  
  const filteredOrders = orders.filter(order => {
    // Default to completed if status is already set
    if (order.status === 'completed' || order.status === 'approved') {
      stats.passed++;
      return true;
    }
    
    // Skip if no completion response
    if (!order.completion_response) {
      stats.noCompletionResponse++;
      return false;
    }
    
    // Get completion data based on response structure
    const completionResponse = order.completion_response;
    
    // Check if completion API call was successful
    if (completionResponse.success !== true) {
      stats.completionNotSuccess++;
      return false;
    }
    
    // Check completion status
    const status = order.completion_status || order.status;
    
    // Skip orders that are still scheduled
    if (status === "scheduled") {
      stats.scheduledStatus++;
      return false;
    }
    
    // Check for valid status (success or failed)
    const hasValidStatus = status === "success" || status === "failed" || 
                          status === "completed" || status === "flagged" || 
                          status === "approved" || status === "rejected";
    if (!hasValidStatus) {
      stats.invalidStatus++;
      return false;
    }
    
    // For completed orders, check if there's timing information
    const completionData = getCompletionData(completionResponse);
    
    if (completionData) {
      const hasStartTime = !!(completionData.startTime || completionData.start_time);
      const hasEndTime = !!(completionData.endTime || completionData.end_time);
      
      if (!hasStartTime || !hasEndTime) {
        stats.noTimeInfo++;
        return false;
      }
    } else {
      stats.noTimeInfo++;
      return false;
    }
    
    // Order passed all checks
    stats.passed++;
    return true;
  });
  
  console.log(`Filtering complete: ${orders.length} input orders, ${filteredOrders.length} filtered orders`);
  console.log("Filtering statistics:", stats);
  
  return filteredOrders;
};

/**
 * Helper function to extract completion data from various response structures
 */
const getCompletionData = (completionResponse: any): any => {
  if (!completionResponse) return null;
  
  // Try different paths to completion data
  if (completionResponse.data) {
    return completionResponse.data;
  }
  
  if (completionResponse.orders && 
      Array.isArray(completionResponse.orders) && 
      completionResponse.orders.length > 0 &&
      completionResponse.orders[0].data) {
    return completionResponse.orders[0].data;
  }
  
  return null;
};
