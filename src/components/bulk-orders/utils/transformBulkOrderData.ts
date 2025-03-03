
import { WorkOrder } from "@/components/workorders/types";

/**
 * Transforms the bulk orders API response into the WorkOrder type structure
 * @param order The order data from the bulk orders API
 * @returns A formatted WorkOrder object
 */
export const transformBulkOrderToWorkOrder = (order: any): WorkOrder => {
  // Handle search data (order details)
  const searchData = order.searchResponse?.data || {};
  
  // Handle completion data
  const completionData = order.completionDetails?.data || {};
  const completionForm = completionData.form || {};
  
  // Extract location information
  const location = searchData.location || {};
  
  // Extract driver information
  const driver = {
    id: order.searchResponse?.scheduleInformation?.driverId || '',
    name: order.searchResponse?.scheduleInformation?.driverName || 'No Driver'
  };
  
  // Extract service date
  const serviceDate = searchData.date || null;
  
  // Extract notes
  const serviceNotes = searchData.notes || '';
  const techNotes = completionForm.note || '';
  
  // Extract image information
  const hasImages = !!(completionForm.images && completionForm.images.length > 0);
  
  // Create a WorkOrder object from the data
  return {
    id: order.id || order.orderId || `temp-${Math.random().toString(36).substring(2, 15)}`,
    order_no: searchData.order_no || order.orderNumber || order.id || 'N/A',
    status: 'pending_review', // Default status for imported orders
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
    signature_url: completionForm.signature?.url || null,
    search_response: order.searchResponse || null,
    completion_response: {
      success: true,
      orders: [{ id: order.id, data: completionData }]
    }
  };
};
