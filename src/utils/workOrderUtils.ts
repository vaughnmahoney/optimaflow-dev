
import { WorkOrder, WorkOrderSearchResponse, WorkOrderCompletionResponse } from "@/components/workorders/types";

/**
 * Transforms raw work order data from Supabase into the application's WorkOrder type
 */
export const transformWorkOrderData = (order: any): WorkOrder => {
  let searchResponse = null;
  let completionResponse = null;
  
  try {
    // Safely parse search_response if it exists and is a string
    if (order.search_response) {
      if (typeof order.search_response === 'string') {
        searchResponse = JSON.parse(order.search_response);
      } else {
        searchResponse = order.search_response;
      }
    }
    
    // Safely parse completion_response if it exists and is a string
    if (order.completion_response) {
      if (typeof order.completion_response === 'string') {
        completionResponse = JSON.parse(order.completion_response);
      } else {
        completionResponse = order.completion_response;
      }
    }
  } catch (error) {
    console.error("Error parsing JSON response:", error);
  }
  
  // Create driver object from searchResponse if available
  let driver = undefined;
  let service_date = null;
  let service_notes = null;
  
  if (searchResponse && searchResponse.scheduleInformation && searchResponse.scheduleInformation.driverName) {
    driver = { 
      id: searchResponse.scheduleInformation.driverId,
      name: searchResponse.scheduleInformation.driverName 
    };
  }
  
  if (searchResponse && searchResponse.data) {
    service_date = searchResponse.data.date;
    service_notes = searchResponse.data.notes;
  }
  
  // Flag to check if the work order has images
  const has_images = !!(completionResponse?.orders?.[0]?.data?.form?.images?.length);
  
  return {
    id: order.id,
    order_no: order.order_no || 'N/A',
    status: order.status || 'pending_review',
    timestamp: order.timestamp || new Date().toISOString(),
    service_date: service_date,
    service_notes: service_notes,
    tech_notes: completionResponse?.orders?.[0]?.data?.form?.note,
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
    location: searchResponse?.data?.location,
    driver: driver,
    // If duration exists in database use it, otherwise set to empty string
    duration: order.duration || '',
    // If lds exists in database use it, otherwise set to empty string
    lds: order.lds || '',
    has_images: has_images,
    signature_url: completionResponse?.orders?.[0]?.data?.form?.signature?.url,
    search_response: searchResponse,
    completion_response: completionResponse
  };
};

/**
 * Calculates work order status counts
 */
export const calculateStatusCounts = (workOrders: WorkOrder[]) => {
  const counts = {
    approved: 0,
    pending_review: 0,
    flagged: 0,
    all: workOrders.length
  };
  
  workOrders.forEach(order => {
    // Count both "flagged" and "flagged_followup" as flagged for the status cards
    const status = order.status === "flagged_followup" ? "flagged" : order.status;
    
    if (status && counts[status] !== undefined) {
      counts[status]++;
    }
  });
  
  return counts;
};
