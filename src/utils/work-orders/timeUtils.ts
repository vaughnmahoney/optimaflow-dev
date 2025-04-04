
import { safelyParseJSON } from './jsonUtils';

/**
 * Extract end_time from various possible sources in a work order
 */
export const extractEndTimeFromWorkOrder = (order: any): string | null => {
  // First check for direct end_time property
  if (order.end_time) {
    return order.end_time;
  }
  
  // Check completion_response
  if (order.completion_response) {
    const completionResponse = safelyParseJSON(order.completion_response);
    if (completionResponse && 
        completionResponse.orders && 
        Array.isArray(completionResponse.orders) &&
        completionResponse.orders[0]?.data?.endTime?.localTime) {
      return new Date(completionResponse.orders[0].data.endTime.localTime).toISOString();
    }
  }
  
  // Fallback to service_date
  if (order.service_date) {
    return new Date(`${order.service_date}T23:59:59Z`).toISOString();
  }
  
  // Last resort, use timestamp
  if (order.timestamp) {
    return order.timestamp;
  }
  
  return null;
};
