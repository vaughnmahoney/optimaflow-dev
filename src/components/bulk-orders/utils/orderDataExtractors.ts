
/**
 * Extracts order number from various possible locations in the data
 */
export const extractOrderNo = (order: any, searchData: any): string => {
  // First try direct properties (handling both camelCase and snake_case)
  if (order.order_no) return order.order_no;
  if (order.orderNo) return order.orderNo;
  
  // Then check nested in searchData or completionDetails
  if (searchData?.orderNo) return searchData.orderNo;
  if (searchData?.order_no) return searchData.order_no;
  
  // Look in searchResponse data
  if (order.searchResponse?.data?.orderNo) return order.searchResponse.data.orderNo;
  if (order.searchResponse?.data?.order_no) return order.searchResponse.data.order_no;
  
  // Look in completionDetails (both camelCase and snake_case)
  const completionDetails = order.completionDetails || order.completion_response;
  if (completionDetails?.orderNo) return completionDetails.orderNo;
  if (completionDetails?.order_no) return completionDetails.order_no;
  
  // Look in data path of completionDetails
  if (completionDetails?.data?.orderNo) return completionDetails.data.orderNo;
  if (completionDetails?.data?.order_no) return completionDetails.data.order_no;
  
  // Look in orders[0] path of completionDetails
  if (completionDetails?.orders && completionDetails.orders.length > 0) {
    if (completionDetails.orders[0].orderNo) return completionDetails.orders[0].orderNo;
    if (completionDetails.orders[0].order_no) return completionDetails.orders[0].order_no;
  }
  
  // Fallback to id if no order number found
  return order.id || 'N/A';
};

/**
 * Extracts service date from various possible locations in the data
 */
export const extractServiceDate = (order: any, searchData: any): string => {
  // First check direct properties
  if (order.service_date) return order.service_date;
  if (order.serviceDate) return order.serviceDate;
  
  // Then check in search data
  if (searchData?.date) return searchData.date;
  if (searchData?.service_date) return searchData.service_date;
  if (searchData?.serviceDate) return searchData.serviceDate;
  
  // Look in searchResponse data
  if (order.searchResponse?.data?.date) return order.searchResponse.data.date;
  if (order.searchResponse?.data?.service_date) return order.searchResponse.data.service_date;
  if (order.searchResponse?.data?.serviceDate) return order.searchResponse.data.serviceDate;
  
  // Try to extract from completion data (both camelCase and snake_case)
  const completionDetails = order.completionDetails || order.completion_response;
  let completionData = null;
  
  // First try direct data property
  if (completionDetails?.data) {
    completionData = completionDetails.data;
  } 
  // Then try orders[0].data path
  else if (completionDetails?.orders && completionDetails.orders.length > 0) {
    completionData = completionDetails.orders[0].data;
  }
  
  // If we have completion data, extract date from startTime
  if (completionData) {
    // Try to extract from startTime
    if (completionData.startTime?.localTime) {
      return completionData.startTime.localTime.split('T')[0];
    }
    if (completionData.start_time?.localTime) {
      return completionData.start_time.localTime.split('T')[0];
    }
    if (completionData.startTime?.local_time) {
      return completionData.startTime.local_time.split('T')[0];
    }
    if (completionData.start_time?.local_time) {
      return completionData.start_time.local_time.split('T')[0];
    }
    
    // Try direct date properties
    if (completionData.service_date) return completionData.service_date;
    if (completionData.serviceDate) return completionData.serviceDate;
    if (completionData.date) return completionData.date;
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
  
  // Check in schedule information (multiple possible paths)
  const checkScheduleInfo = (scheduleInfo: any) => {
    if (!scheduleInfo) return null;
    
    if (scheduleInfo.driverName || scheduleInfo.driver_name) {
      return {
        id: scheduleInfo.driverId || scheduleInfo.driver_id || scheduleInfo.driverSerial || scheduleInfo.driver_serial || 'unknown',
        name: scheduleInfo.driverName || scheduleInfo.driver_name
      };
    }
    return null;
  };
  
  // Check various possible paths for schedule information
  const scheduleFromResponse = order.searchResponse?.scheduleInformation;
  const scheduleFromSearchData = searchData?.scheduleInformation;
  const scheduleFromOrder = order.scheduleInformation;
  
  return checkScheduleInfo(scheduleFromResponse) ||
         checkScheduleInfo(scheduleFromSearchData) ||
         checkScheduleInfo(scheduleFromOrder) ||
         null;
};

/**
 * Extracts notes from various possible locations in the data
 */
export const extractNotes = (order: any, searchData: any): string => {
  // Check in direct properties
  if (order.notes) return order.notes;
  if (order.serviceNotes || order.service_notes) return order.serviceNotes || order.service_notes;
  
  // Check in search data
  if (searchData?.notes) return searchData.notes;
  if (searchData?.serviceNotes || searchData?.service_notes) return searchData.serviceNotes || searchData.service_notes;
  
  // Check in search response data
  if (order.searchResponse?.data?.notes) return order.searchResponse.data.notes;
  
  // Check in completion data (multiple possible paths)
  const completionDetails = order.completionDetails || order.completion_response;
  let completionData = null;
  
  // Try different paths to find completion data
  if (completionDetails?.data) {
    completionData = completionDetails.data;
  } else if (completionDetails?.orders && completionDetails.orders.length > 0) {
    completionData = completionDetails.orders[0].data;
  }
  
  if (completionData) {
    // Try form notes
    if (completionData.form?.note) return completionData.form.note;
    
    // Try direct note properties
    if (completionData.note) return completionData.note;
    if (completionData.notes) return completionData.notes;
  }
  
  return '';
};
