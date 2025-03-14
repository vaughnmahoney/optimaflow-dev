
/**
 * Utility functions for extracting and normalizing dates from work order objects
 */

import { WorkOrder } from "@/components/workorders/types";

/**
 * Extracts the best available date from a work order using a consistent hierarchy:
 * 1. Completion end time (most accurate for when service was completed)
 * 2. Service date from search response 
 * 3. Timestamp as last resort
 * 
 * @param order Work order object
 * @returns Date object or null if no valid date is found
 */
export const extractServiceDate = (order: WorkOrder): Date | null => {
  // 1. First try to use completion end time (most accurate for service completion)
  const endTime = order.completion_response?.orders?.[0]?.data?.endTime?.localTime;
  if (endTime) {
    try {
      const date = new Date(endTime);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, continue to fallbacks
    }
  }
  
  // 2. Try to get date from search_response
  const searchDate = order.search_response?.data?.date;
  if (searchDate) {
    try {
      const date = new Date(searchDate);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, continue to fallback
    }
  }
  
  // 3. Finally, fall back to timestamp if available
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

/**
 * Compare two dates for sorting with proper handling of null values
 * 
 * @param dateA First date
 * @param dateB Second date 
 * @param ascending Sort direction
 * @returns Comparison result (-1, 0, 1)
 */
export const compareDates = (
  dateA: Date | null, 
  dateB: Date | null, 
  ascending: boolean = true
): number => {
  // If both dates are null, consider them equal
  if (dateA === null && dateB === null) return 0;
  
  // Null dates come last in either sort direction
  if (dateA === null) return ascending ? 1 : -1;
  if (dateB === null) return ascending ? -1 : 1;
  
  // Compare valid dates
  const comparison = dateA.getTime() - dateB.getTime();
  return ascending ? comparison : -comparison;
};
