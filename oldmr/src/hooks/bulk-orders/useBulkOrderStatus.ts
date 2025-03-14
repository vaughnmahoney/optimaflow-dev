
import { WorkOrder } from "@/components/workorders/types";

export const useBulkOrderStatus = () => {
  // Extract completion status exactly like WorkOrderRow does
  const getCompletionStatus = (order: any): string | undefined => {
    const status = order.completion_status || 
           (order.completionDetails?.data?.status) ||
           (order.completion_response?.orders?.[0]?.data?.status) ||
           (order.search_response?.scheduleInformation?.status);
    
    // Return standardized completion status
    if (status) {
      return status.toLowerCase();
    }
    
    return undefined;
  };

  // Get QC status (internal review status) exactly like WorkOrderRow
  const getQcStatus = (order: any): string => {
    // If there's an explicit status property, use it
    if (order.status) {
      return order.status;
    }
    
    // For new imports without status, use pending_review
    return "pending_review";
  };

  // Transform raw order to work order format with correct status
  const transformOrderStatus = (order: any): Partial<WorkOrder> => {
    return {
      id: order.id || `bulk-${Math.random().toString(36).substr(2, 9)}`,
      status: getQcStatus(order),
      completion_status: getCompletionStatus(order),
      // Keep other necessary fields for status display
      order_no: order.order_no || order.data?.orderNo || 'N/A',
      service_date: order.service_date || order.data?.date,
      // Include resolved information if available
      resolved_at: order.resolved_at,
      resolution_notes: order.resolution_notes
    };
  };

  return {
    getCompletionStatus,
    getQcStatus,
    transformOrderStatus
  };
};
