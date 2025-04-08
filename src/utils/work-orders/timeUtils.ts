
import { safelyParseJSON } from './jsonUtils';
import { toLocalTime } from '../dateUtils';

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
      return completionResponse.orders[0].data.endTime.localTime;
    }
  }
  
  // Fallback to service_date
  if (order.service_date) {
    return order.service_date;
  }
  
  // Last resort, use timestamp
  if (order.timestamp) {
    return order.timestamp;
  }
  
  return null;
};

/**
 * Extracts end time as a Date object in the user's local timezone
 */
export const getEndTimeAsLocalDate = (order: any): Date | null => {
  const endTimeStr = extractEndTimeFromWorkOrder(order);
  return toLocalTime(endTimeStr);
};
