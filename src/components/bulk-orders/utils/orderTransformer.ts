
import { WorkOrder } from "@/components/workorders/types";
import { 
  normalizeCompletionData,
  normalizeImageData,
  normalizeSignatureData
} from "./normalizeData";

interface RawOrderData {
  id: string;
  orderNo?: string;
  order_no?: string;
  searchResponse?: any;
  completionDetails?: any;
  completion_response?: any;
  [key: string]: any;
}

/**
 * Extract the end_time from various sources in the order data
 * @param order Raw order data
 * @param completionData Normalized completion data
 * @returns ISO string timestamp or null
 */
const extractEndTime = (order: RawOrderData, completionData: any): string | null => {
  // First check completion_response for endTime
  if (order.completion_response && typeof order.completion_response === 'object') {
    if (order.completion_response.orders && 
        Array.isArray(order.completion_response.orders) && 
        order.completion_response.orders[0]) {
      const completionOrder = order.completion_response.orders[0];
      // Try to get end_time from completion_response.orders[0].data.endTime
      if (completionOrder.data && completionOrder.data.endTime) {
        const timeData = completionOrder.data.endTime;
        if (timeData.localTime) {
          return new Date(timeData.localTime).toISOString();
        }
      }
    }
  }
  
  // Next check completionDetails
  if (order.completionDetails && typeof order.completionDetails === 'object') {
    // Try to get end_time from completionDetails.data.endTime
    if (order.completionDetails.data && order.completionDetails.data.endTime) {
      const timeData = order.completionDetails.data.endTime;
      if (timeData.localTime) {
        return new Date(timeData.localTime).toISOString();
      }
    }
  }
  
  // Check normalized completion data
  if (completionData && completionData.endTime) {
    return new Date(completionData.endTime).toISOString();
  }
  
  // Fallback to service_date if available
  const serviceDate = order.service_date || 
                     (order.searchResponse && order.searchResponse.data && order.searchResponse.data.date);
  
  if (serviceDate) {
    // We don't have a time component, so use end of day for sorting purposes
    return new Date(`${serviceDate}T23:59:59Z`).toISOString();
  }
  
  return null;
};

/**
 * Extract the OptimoRoute status from various sources in the order data
 * @param order Raw order data
 * @param completionData Normalized completion data
 * @returns string status or null
 */
const extractOptimoRouteStatus = (order: RawOrderData, completionData: any): string | null => {
  // First check completion_response for status
  if (order.completion_response && typeof order.completion_response === 'object') {
    if (order.completion_response.orders && 
        Array.isArray(order.completion_response.orders) && 
        order.completion_response.orders[0]) {
      const completionOrder = order.completion_response.orders[0];
      // Try to get status from completion_response.orders[0].data.status
      if (completionOrder.data && completionOrder.data.status) {
        return completionOrder.data.status;
      }
    }
    // Check direct data property
    if (order.completion_response.data && order.completion_response.data.status) {
      return order.completion_response.data.status;
    }
  }
  
  // Next check completionDetails
  if (order.completionDetails && typeof order.completionDetails === 'object') {
    if (order.completionDetails.data && order.completionDetails.data.status) {
      return order.completionDetails.data.status;
    }
  }
  
  // Check normalized completion data
  if (completionData && completionData.status) {
    return completionData.status;
  }
  
  // Finally check if the order already has an optimoroute_status
  if (order.optimoroute_status) {
    return order.optimoroute_status;
  }
  
  return null;
};

/**
 * Transform a raw API order into a consistent WorkOrder type
 * @param order Raw order data from API
 * @returns Formatted WorkOrder object
 */
export const transformOrder = (order: RawOrderData): WorkOrder => {
  console.log(`Transforming order: ${order.orderNo || order.order_no || order.id}`);
  
  // Normalize the search data
  const searchData = order.searchResponse?.data || {};
  
  // Get completion details from either camelCase or snake_case fields
  const rawCompletionDetails = order.completionDetails || order.completion_response || {};
  
  // Normalize the completion data structure
  const completionForm = rawCompletionDetails.data?.form || 
                        (rawCompletionDetails.orders && rawCompletionDetails.orders[0]?.data?.form) || 
                        {};
  
  // Get normalized completion data
  const completionData = normalizeCompletionData(rawCompletionDetails);
  
  // Extract basic order information
  const orderNo = order.order_no || order.orderNo || searchData.orderNo || searchData.order_no || 'N/A';
  const serviceDate = searchData.date || searchData.serviceDate || null;
  const serviceNotes = searchData.notes || searchData.serviceNotes || '';
  
  // Extract end_time using the dedicated function
  const endTime = extractEndTime(order, completionData);
  
  // Extract optimoroute_status using the new dedicated function
  const optimoRouteStatus = extractOptimoRouteStatus(order, completionData);
  
  // Extract driver information
  const driver = extractDriverInfo(order, searchData);
  
  // Extract location information
  const location = extractLocationInfo(order, searchData);
  
  // Extract tech notes
  const techNotes = completionForm.note || completionData?.note || '';
  
  // Process image and signature data
  const hasImages = normalizeImageData(completionForm, completionData);
  const signatureUrl = normalizeSignatureData(completionForm, completionData);
  const trackingUrl = completionData?.trackingUrl || null;
  
  // Determine completion status
  const completionStatus = completionData?.status || null;
  
  // Generate a unique ID if one doesn't exist
  const id = order.id || `temp-${Math.random().toString(36).substring(2, 15)}`;
  
  // Generate a status based on completion status
  const status = !completionStatus ? 'imported' :
                completionStatus === 'success' ? 'completed' :
                completionStatus === 'failed' ? 'rejected' : 'imported';
  
  // Create final WorkOrder object
  const result: WorkOrder = {
    id,
    order_no: orderNo,
    status,
    timestamp: new Date().toISOString(),
    service_date: serviceDate,
    end_time: endTime,
    service_notes: serviceNotes,
    tech_notes: techNotes,
    notes: order.notes || '',
    qc_notes: order.qc_notes || '',
    resolution_notes: order.resolution_notes || '',
    location,
    driver,
    has_images: hasImages,
    signature_url: signatureUrl,
    tracking_url: trackingUrl,
    completion_status: completionStatus,
    optimoroute_status: optimoRouteStatus, // Add the extracted optimoroute_status
    search_response: order.searchResponse || null,
    completion_response: rawCompletionDetails || null
  };
  
  return result;
};

/**
 * Extract driver information from order data
 */
const extractDriverInfo = (order: any, searchData: any) => {
  // Try to find driver information in different possible locations
  if (searchData.driver && typeof searchData.driver === 'object') {
    return {
      id: searchData.driver.id || searchData.driver.driverId || null,
      name: searchData.driver.name || searchData.driver.driverName || null
    };
  }
  
  if (searchData.driverName) {
    return {
      id: searchData.driverId || null,
      name: searchData.driverName
    };
  }
  
  if (order.driver && typeof order.driver === 'object') {
    return order.driver;
  }
  
  // If no driver info found
  return null;
};

/**
 * Extract location information from order data
 */
const extractLocationInfo = (order: any, searchData: any) => {
  let locationName = 'N/A';
  let locationObj: any = {};
  
  // Try to find location information in different possible locations
  if (searchData.location) {
    if (typeof searchData.location === 'object') {
      locationObj = searchData.location;
      locationName = searchData.location.name || 
                    searchData.location.locationName || 
                    'N/A';
    } else if (typeof searchData.location === 'string') {
      locationName = searchData.location;
    }
  } 
  else if (searchData.locationName) {
    locationName = searchData.locationName;
  } 
  else if (searchData.location_name) {
    locationName = searchData.location_name;
  }
  else if (order.location) {
    if (typeof order.location === 'object') {
      locationObj = order.location;
      locationName = order.location.name ||
                     order.location.locationName ||
                     'N/A';
    } else if (typeof order.location === 'string') {
      locationName = order.location;
    }
  }
  else if (searchData.customer && typeof searchData.customer === 'object') {
    locationName = searchData.customer.name || 'N/A';
    // Check if customer object has location info
    if (searchData.customer.location && typeof searchData.customer.location === 'object') {
      locationObj = searchData.customer.location;
    }
  }
  
  // Build location object with all available details
  return {
    name: locationName,
    address: locationObj.address || searchData.address || order.address || null,
    city: locationObj.city || searchData.city || order.city || null,
    state: locationObj.state || searchData.state || order.state || null,
    zip: locationObj.zip || searchData.zip || order.zip || null,
  };
};
