
import { WorkOrder } from "@/components/workorders/types";

/**
 * Extracts order number from various possible locations in the order data
 */
export const extractOrderNo = (order: any, searchData: any): string => {
  return (
    // From search_orders API (inside data object)
    searchData.orderNo || 
    // From search_orders when data structure is flattened
    searchData.data?.orderNo || 
    // From get_completion_details API
    order.completionDetails?.orderNo || 
    // Direct access from order (merged data)
    order.orderNo || 
    // Fallbacks
    order.order_no || 
    order.id || 
    'N/A'
  );
};

/**
 * Extracts service date from various possible locations in the order data
 */
export const extractServiceDate = (order: any, searchData: any): string | null => {
  if (searchData.date) {
    return searchData.date;
  } else if (searchData.scheduled_date) {
    return searchData.scheduled_date;
  } else if (order.searchResponse?.scheduleInformation?.date) {
    return order.searchResponse.scheduleInformation.date;
  } else if (order.date) {
    return order.date;
  }
  return null;
};

/**
 * Extracts driver information from various possible locations in the order data
 */
export const extractDriverInfo = (order: any, searchData: any): { id: string, name: string } => {
  const driverId = 
    order.searchResponse?.scheduleInformation?.driverId || 
    searchData.driver_id || 
    searchData.driverId || 
    order.driverId ||
    '';
    
  const driverName = 
    order.searchResponse?.scheduleInformation?.driverName || 
    searchData.driver_name || 
    searchData.driverName ||
    order.driverName ||
    'No Driver';
  
  return {
    id: driverId,
    name: driverName
  };
};

/**
 * Extracts notes from various possible locations in the order data
 */
export const extractNotes = (order: any, searchData: any, completionForm: any, completionData: any): { 
  serviceNotes: string, 
  techNotes: string 
} => {
  return {
    serviceNotes: searchData.notes || order.notes || '',
    techNotes: completionForm.note || completionData.note || ''
  };
};
