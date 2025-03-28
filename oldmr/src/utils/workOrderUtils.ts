
import { WorkOrder } from "@/components/workorders/types";

/**
 * Calculate counts for each status type in the work orders array
 */
export const calculateStatusCounts = (workOrders: WorkOrder[]) => {
  const counts = {
    approved: 0,
    pending_review: 0,
    flagged: 0,
    resolved: 0,
    rejected: 0,
    all: workOrders.length
  };
  
  workOrders.forEach(workOrder => {
    const status = workOrder.status || 'pending_review';
    
    // Group flagged_followup under flagged for the counts
    const normalizedStatus = status === 'flagged_followup' ? 'flagged' : status;
    
    if (counts[normalizedStatus] !== undefined) {
      counts[normalizedStatus]++;
    }
  });
  
  return counts;
};

/**
 * Safely parses JSON data or returns the original if it's already an object
 */
const safelyParseJSON = (jsonData: any): any => {
  if (!jsonData) return null;
  
  if (typeof jsonData === 'string') {
    try {
      return JSON.parse(jsonData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }
  
  // If it's already an object, return it as is
  return jsonData;
};

/**
 * Transforms raw work order data from Supabase into the application's WorkOrder type
 */
export const transformWorkOrderData = (order: any): WorkOrder => {
  // Safely parse JSON fields if they're strings
  const searchResponse = safelyParseJSON(order.search_response);
  const completionResponse = safelyParseJSON(order.completion_response);
  
  // Create driver object from searchResponse if available
  let driver = null;
  let service_date = null;
  let service_notes = null;
  let lds = null;
  
  if (searchResponse && typeof searchResponse === 'object') {
    // Safely extract driver information
    if (searchResponse.scheduleInformation && typeof searchResponse.scheduleInformation === 'object') {
      driver = { 
        id: searchResponse.scheduleInformation.driverId,
        name: searchResponse.scheduleInformation.driverName 
      };
    }
    
    // Safely extract service information
    if (searchResponse.data && typeof searchResponse.data === 'object') {
      service_date = searchResponse.data.date;
      service_notes = searchResponse.data.notes;
      
      // Extract LDS from customField5 if available
      if (searchResponse.data.customField5) {
        lds = searchResponse.data.customField5;
        // If LDS contains a timestamp, extract just the date part
        if (lds.includes(" ")) {
          lds = lds.split(" ")[0];
        }
      }
    }
  }
  
  // Flag to check if the work order has images
  const has_images = !!(
    completionResponse && 
    typeof completionResponse === 'object' &&
    completionResponse.orders && 
    Array.isArray(completionResponse.orders) &&
    completionResponse.orders[0] && 
    completionResponse.orders[0].data && 
    completionResponse.orders[0].data.form && 
    completionResponse.orders[0].data.form.images && 
    Array.isArray(completionResponse.orders[0].data.form.images) &&
    completionResponse.orders[0].data.form.images.length > 0
  );
  
  // Create a location object with safe property access
  let location = null;
  if (searchResponse && 
      typeof searchResponse === 'object' && 
      searchResponse.data && 
      typeof searchResponse.data === 'object' && 
      searchResponse.data.location) {
    location = searchResponse.data.location;
  }
  
  return {
    id: order.id,
    order_no: order.order_no || 'N/A',
    status: order.status || 'pending_review',
    timestamp: order.timestamp || new Date().toISOString(),
    service_date: service_date,
    service_notes: service_notes,
    tech_notes: completionResponse && 
                typeof completionResponse === 'object' && 
                completionResponse.orders && 
                completionResponse.orders[0] && 
                completionResponse.orders[0].data && 
                completionResponse.orders[0].data.form && 
                completionResponse.orders[0].data.form.note,
    // If notes exists in database use it, otherwise set to empty string
    notes: order.notes || '',
    // Include QC notes from database or empty string
    qc_notes: order.qc_notes || '',
    // Include resolution notes from database or empty string
    resolution_notes: order.resolution_notes || '',
    // Include resolution timestamp
    resolved_at: order.resolved_at || null,
    // Include resolver ID (would be a user ID in a real app with auth)
    resolver_id: order.resolver_id || null,
    location: location,
    driver: driver,
    // If duration exists in database use it, otherwise set to empty string
    duration: order.duration || '',
    // If lds exists in database use it, otherwise extract from customField5
    lds: lds || order.lds || '',
    has_images: has_images,
    signature_url: completionResponse && 
                  typeof completionResponse === 'object' && 
                  completionResponse.orders && 
                  completionResponse.orders[0] && 
                  completionResponse.orders[0].data && 
                  completionResponse.orders[0].data.form && 
                  completionResponse.orders[0].data.form.signature && 
                  completionResponse.orders[0].data.form.signature.url,
    search_response: searchResponse,
    completion_response: completionResponse
  };
};
