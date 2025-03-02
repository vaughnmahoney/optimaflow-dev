
import { WorkOrder, WorkOrderSearchResponse, WorkOrderCompletionResponse } from "@/components/workorders/types";

/**
 * Transforms raw work order data from Supabase into the application's WorkOrder type
 */
export const transformWorkOrderData = (order: any): WorkOrder => {
  const searchResponse = order.search_response as unknown as WorkOrderSearchResponse;
  const completionResponse = order.completion_response as unknown as WorkOrderCompletionResponse;
  
  // Create driver object from searchResponse if available
  const driver = searchResponse?.scheduleInformation?.driverName 
    ? { 
        id: searchResponse.scheduleInformation.driverId,
        name: searchResponse.scheduleInformation.driverName 
      } 
    : undefined;
  
  return {
    id: order.id,
    order_no: order.order_no || 'N/A',
    status: order.status || 'pending_review',
    timestamp: order.timestamp || new Date().toISOString(),
    service_date: searchResponse?.data?.date,
    service_notes: searchResponse?.data?.notes,
    tech_notes: completionResponse?.orders?.[0]?.data?.form?.note,
    // If notes exists in database use it, otherwise set to empty string
    notes: order.notes || '',
    location: searchResponse?.data?.location,
    driver: driver,
    // If duration exists in database use it, otherwise set to empty string
    duration: order.duration || '',
    // If lds exists in database use it, otherwise set to empty string
    lds: order.lds || '',
    has_images: Boolean(completionResponse?.orders?.[0]?.data?.form?.images?.length),
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
    if (order.status && counts[order.status] !== undefined) {
      counts[order.status]++;
    }
  });
  
  return counts;
};
