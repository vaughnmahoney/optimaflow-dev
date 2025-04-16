
import { WorkOrder } from "../../types";
import { toLocalTime } from "@/utils/dateUtils";

/**
 * Extracts the best available date from a work order
 * Tries end_time first, then service_date, then completion data, then timestamp
 * Returns date objects in the user's local timezone
 */
export const getServiceDateValue = (order: WorkOrder): Date | null => {
  // First try to use end_time if available as it's most accurate
  if (order.end_time) {
    const localDate = toLocalTime(order.end_time);
    if (localDate) return localDate;
  }
  
  // Try service_date next
  if (order.service_date) {
    const localDate = toLocalTime(order.service_date);
    if (localDate) return localDate;
  }
  
  // Try to get the end date from completion data as fallback
  const endTime = order.completion_response?.orders?.[0]?.data?.endTime?.localTime;
  if (endTime) {
    const localDate = toLocalTime(endTime);
    if (localDate) return localDate;
  }
  
  // Finally, fall back to timestamp if available
  if (order.timestamp) {
    const localDate = toLocalTime(order.timestamp);
    if (localDate) return localDate;
  }
  
  return null;
};
