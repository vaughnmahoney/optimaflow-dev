
import { WorkOrder } from "../../types";

/**
 * Extracts the location name from a work order
 */
export const getLocationName = (order: WorkOrder): string => {
  if (!order.location) return 'N/A';
  
  if (typeof order.location === 'object') {
    return order.location.name || order.location.locationName || 'N/A';
  }
  
  return 'N/A';
};

/**
 * Extracts the driver name from a work order
 */
export const getDriverName = (order: WorkOrder): string => {
  if (!order.driver) return 'No Driver Assigned';
  
  if (typeof order.driver === 'object' && order.driver.name) {
    return order.driver.name;
  }
  
  return 'No Driver Name';
};
