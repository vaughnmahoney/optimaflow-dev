
import { WorkOrder } from "../../types";

/**
 * Extracts the best available date from a work order
 * Tries end_time first, then service_date, then completion data, then timestamp
 */
export const getServiceDateValue = (order: WorkOrder): Date | null => {
  // First try to use end_time if available as it's most accurate
  if (order.end_time) {
    try {
      const date = new Date(order.end_time);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, continue to fallbacks
    }
  }
  
  // Try service_date next
  if (order.service_date) {
    try {
      const date = new Date(order.service_date);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, continue to fallbacks
    }
  }
  
  // Try to get the end date from completion data as fallback
  const endTime = order.completion_response?.orders?.[0]?.data?.endTime?.localTime;
  if (endTime) {
    try {
      const date = new Date(endTime);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If date parsing fails, continue to fallback
    }
  }
  
  // Finally, fall back to timestamp if available
  if (order.timestamp) {
    try {
      const date = new Date(order.timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, return null
    }
  }
  
  return null;
};
