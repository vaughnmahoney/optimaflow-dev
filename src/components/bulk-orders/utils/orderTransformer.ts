
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
