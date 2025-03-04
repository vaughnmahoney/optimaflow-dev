
import { WorkOrder } from "@/components/workorders/types";

/**
 * Transforms the bulk orders API response into the WorkOrder type structure
 * @param order The order data from the bulk orders API
 * @returns A formatted WorkOrder object
 */
export const transformBulkOrderToWorkOrder = (order: any): WorkOrder => {
  console.log("Transform input:", JSON.stringify(order).substring(0, 500) + "...");
  
  // Handle search data (order details)
  const searchData = order.searchResponse?.data || {};
  
  // Handle completion data
  const completionData = order.completionDetails?.data || {};
  const completionForm = completionData.form || {};
  
  // Get the order number
  const orderNo = searchData.orderNumber || searchData.order_no || order.orderNumber || order.id || 'N/A';
  
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
  
  // Extract location information - check multiple possible paths
  let locationName = 'N/A';
  let locationObj: any = {};
  
  if (searchData.location) {
    if (typeof searchData.location === 'object') {
      locationObj = searchData.location;
      locationName = searchData.location.name || 
                    searchData.location.locationName || 
                    searchData.location.location_name || 
                    'N/A';
    } else if (typeof searchData.location === 'string') {
      locationName = searchData.location;
    }
  } else if (searchData.locationName) {
    locationName = searchData.locationName;
  } else if (searchData.location_name) {
    locationName = searchData.location_name;
  } else if (order.location) {
    if (typeof order.location === 'object') {
      locationObj = order.location;
      locationName = order.location.name ||
                     order.location.locationName ||
                     order.location.location_name ||
                     'N/A';
    } else if (typeof order.location === 'string') {
      locationName = order.location;
    }
  }
  
  // Collect additional location info
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
  
  const result: WorkOrder = {
    id: order.id || order.orderId || `temp-${Math.random().toString(36).substring(2, 15)}`,
    order_no: orderNo,
    status: 'imported', // Set status as 'imported' for bulk imported orders
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
    location: result.location,
    driver: result.driver,
    hasImages: result.has_images
  });
  
  return result;
};
