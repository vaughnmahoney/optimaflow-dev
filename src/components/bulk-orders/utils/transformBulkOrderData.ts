
import { WorkOrder } from "@/components/workorders/types";
import { extractOrderNo, extractServiceDate, extractDriverInfo, extractNotes } from "./orderDataExtractors";
import { extractLocationInfo } from "./locationDataExtractor";
import { extractCompletionInfo } from "./completionDataExtractor";
import { logInputOrderStructure, logOrderNumber, logCompletionDetails, logTransformOutput } from "./transformLoggers";

/**
 * Transforms the bulk orders API response into the WorkOrder type structure
 * @param order The order data from the bulk orders API
 * @returns A formatted WorkOrder object
 */
export const transformBulkOrderToWorkOrder = (order: any): WorkOrder => {
  // Log input order structure for debugging
  logInputOrderStructure(order);
  
  // Handle search data (order details)
  const searchData = order.searchResponse?.data || {};
  
  // Handle completion data
  const completionData = order.completionDetails?.data || {};
  const completionForm = completionData.form || {};
  
  // Extract order number
  const orderNo = extractOrderNo(order, searchData);
  logOrderNumber(orderNo);
  
  // Extract service date
  const serviceDate = extractServiceDate(order, searchData);
  
  // Extract driver information
  const driver = extractDriverInfo(order, searchData);
  
  // Extract location information
  const location = extractLocationInfo(order, searchData);
  
  // Extract notes - fix missing order parameter
  const serviceNotes = searchData.notes || order.notes || '';
  const techNotes = completionForm.note || completionData.note || '';
  
  // Extract completion information
  const { hasImages, signatureUrl, trackingUrl, completionStatus } = 
    extractCompletionInfo(completionForm, completionData);
  
  // Log completion details for debugging
  if (completionData) {
    logCompletionDetails(orderNo, completionStatus, trackingUrl, signatureUrl, hasImages);
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
  
  logTransformOutput(result);
  
  return result;
};
