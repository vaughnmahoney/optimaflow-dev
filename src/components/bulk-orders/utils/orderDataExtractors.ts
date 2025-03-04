
/**
 * Extracts order number from various possible locations in the data
 */
export const extractOrderNo = (order: any, searchData: any): string => {
  // First try direct properties (handling both camelCase and snake_case)
  if (order.order_no) return order.order_no;
  if (order.orderNo) return order.orderNo;
  
  // Then check nested in searchData or completionDetails
  if (searchData?.orderNo) return searchData.orderNo;
  if (order.searchResponse?.data?.orderNo) return order.searchResponse.data.orderNo;
  if (order.completionDetails?.orderNo) return order.completionDetails.orderNo;
  
  // Fallback to id if no order number found
  return order.id || 'N/A';
};

/**
 * Extracts service date from various possible locations in the data
 */
export const extractServiceDate = (order: any, searchData: any): string => {
  // First check direct properties
  if (order.service_date) return order.service_date;
  
  // Then check in search data
  if (searchData?.date) return searchData.date;
  if (order.searchResponse?.data?.date) return order.searchResponse.data.date;
  
  // Try to extract from completion data
  if (order.completionDetails?.data?.startTime?.localTime) {
    const localTime = order.completionDetails.data.startTime.localTime;
    // Extract just the date part
    return localTime.split('T')[0];
  }
  
  // Default to today's date if nothing found
  return new Date().toISOString().split('T')[0];
};

/**
 * Extracts driver information from various possible locations in the data
 */
export const extractDriverInfo = (order: any, searchData: any): { id: string; name: string; } | null => {
  // First check direct driver property
  if (order.driver) return order.driver;
  
  // Then check in searchData
  if (searchData?.driver) return searchData.driver;
  
  // Check in search response
  if (order.searchResponse?.data?.driver) return order.searchResponse.data.driver;
  
  // Check in schedule information
  if (order.searchResponse?.scheduleInformation) {
    const schedule = order.searchResponse.scheduleInformation;
    if (schedule.driverName) {
      return {
        id: schedule.driverId || schedule.driverSerial || 'unknown',
        name: schedule.driverName
      };
    }
  }
  
  return null;
};

/**
 * Extracts notes from various possible locations in the data
 */
export const extractNotes = (order: any, searchData: any): string => {
  // Check in direct properties
  if (order.notes) return order.notes;
  
  // Check in search data
  if (searchData?.notes) return searchData.notes;
  
  // Check in completion data
  if (order.completionDetails?.data?.form?.note) return order.completionDetails.data.form.note;
  if (order.completionDetails?.data?.note) return order.completionDetails.data.note;
  
  return '';
};
