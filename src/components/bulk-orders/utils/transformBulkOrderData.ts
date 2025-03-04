
import { WorkOrder } from "@/components/workorders/types";

/**
 * Transforms the bulk orders API response into the WorkOrder type structure
 * @param order The order data from the bulk orders API
 * @returns A formatted WorkOrder object
 */
export const transformBulkOrderToWorkOrder = (order: any): WorkOrder => {
  // Enhanced logging - show more of the object structure
  console.log("Transform input order structure:", JSON.stringify({
    id: order.id,
    orderNo: order.orderNo,
    searchResponse: order.searchResponse ? {
      success: order.searchResponse.success,
      data: order.searchResponse.data ? {
        orderNo: order.searchResponse.data.orderNo,
        date: order.searchResponse.data.date,
        driverInfo: order.searchResponse.data.driver,
        location: order.searchResponse.data.location,
      } : null,
      scheduleInformation: order.searchResponse.scheduleInformation
    } : null,
    completionDetails: order.completionDetails ? {
      success: order.completionDetails.success,
      orderNo: order.completionDetails.orderNo,
      status: order.completionDetails.data?.status,
      hasTrackingUrl: !!order.completionDetails.data?.tracking_url
    } : null
  }, null, 2));
  
  // Handle search data (order details)
  const searchData = order.searchResponse?.data || {};
  
  // Handle completion data
  const completionData = order.completionDetails?.data || {};
  const completionForm = completionData.form || {};
  
  // Get the order number - correct paths based on API structure
  // Search for orderNo in the expected locations based on API docs
  const orderNo = 
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
    'N/A';
  
  console.log("Found order number:", orderNo);
  
  // Extract service date - check multiple possible paths
  let serviceDate = null;
  if (searchData.date) {
    serviceDate = searchData.date;
  } else if (searchData.scheduled_date) {
    serviceDate = searchData.scheduled_date;
  } else if (order.searchResponse?.scheduleInformation?.date) {
    serviceDate = order.searchResponse.scheduleInformation.date;
  } else if (order.date) {
    serviceDate = order.date;
  }
  
  // Extract driver information - check multiple possible paths
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
  
  const driver = {
    id: driverId,
    name: driverName
  };
  
  // Enhanced location extraction - including deeper paths in the structure
  // Properly handle nested location data in different possible formats
  let locationName = 'N/A';
  let locationObj: any = {};
  
  // First try direct location object in searchData
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
  // Try alternate location paths
  else if (searchData.locationName) {
    locationName = searchData.locationName;
  } 
  else if (searchData.location_name) {
    locationName = searchData.location_name;
  }
  // Try location in the order root
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
  // Try extracting location from customer data if available
  else if (searchData.customer && typeof searchData.customer === 'object') {
    locationName = searchData.customer.name || 'N/A';
    // Check if customer object has location info
    if (searchData.customer.location && typeof searchData.customer.location === 'object') {
      locationObj = searchData.customer.location;
    }
  }
  
  // Build location object with all available details
  const location = {
    ...locationObj,
    name: locationName,
    address: locationObj.address || searchData.address || order.address || null,
    city: locationObj.city || searchData.city || order.city || null,
    state: locationObj.state || searchData.state || order.state || null,
    zip: locationObj.zip || searchData.zip || order.zip || null,
  };
  
  // Extract notes
  const serviceNotes = searchData.notes || order.notes || '';
  const techNotes = completionForm.note || completionData.note || '';
  
  // Extract image information
  const hasImages = !!(
    completionForm.images && 
    completionForm.images.length > 0
  );
  
  // Handle signature information
  const signatureUrl = completionForm.signature?.url || null;
  
  // Extract tracking URL
  const trackingUrl = completionData.tracking_url || null;
  
  // Extract completion status
  const completionStatus = completionData.status || null;
  
  // Enhanced logging for completion details
  if (completionData) {
    console.log(`Order ${orderNo} completion details:`, {
      status: completionStatus,
      hasTrackingUrl: !!trackingUrl,
      hasSignature: !!signatureUrl,
      hasImages
    });
  }

  const result: WorkOrder = {
    id: order.id || order.orderId || `temp-${Math.random().toString(36).substring(2, 15)}`,
    order_no: orderNo,
    status: completionStatus === 'success' ? 'completed' : 
            completionStatus === 'failed' ? 'rejected' : 'imported',
    timestamp: new Date().toISOString(),
    service_date: serviceDate,
    service_notes: serviceNotes,
    tech_notes: techNotes,
    notes: '',
    qc_notes: '',
    resolution_notes: '',
    location,
    driver,
    has_images: hasImages,
    signature_url: signatureUrl,
    tracking_url: trackingUrl,
    completion_status: completionStatus,
    search_response: order.searchResponse || null,
    completion_response: {
      success: true,
      orders: [{ 
        id: order.id || order.orderId || '', 
        data: completionData 
      }]
    }
  };
  
  console.log("Transform output:", {
    id: result.id,
    order_no: result.order_no,
    status: result.status,
    location: result.location.name,
    driver: result.driver.name,
    hasImages: result.has_images,
    hasTrackingUrl: !!result.tracking_url
  });
  
  return result;
};
