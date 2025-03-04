
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
  
  // Handle completion data with safe null checks - checking both snake_case and camelCase versions
  // Check for both camelCase and snake_case styles in the data structure
  const completionDetails = order.completionDetails || order.completion_response || {};
  
  // Determine the correct path for completion data
  let completionData = completionDetails.data;
  
  // If data isn't directly on completionDetails, check if it's in an orders array
  if (!completionData && completionDetails.orders && completionDetails.orders.length > 0) {
    completionData = completionDetails.orders[0].data;
  }
  
  // Default to empty object if still not found
  completionData = completionData || {};
  
  // Similarly handle form data which could be at different paths
  const completionForm = completionData.form || {};
  
  // Extract order number with fallbacks (handle both camelCase and snake_case)
  const orderNo = extractOrderNo(order, searchData);
  logOrderNumber(orderNo);
  
  // Extract service date
  const serviceDate = extractServiceDate(order, searchData);
  
  // Extract driver information
  const driver = extractDriverInfo(order, searchData);
  
  // Extract location information
  const location = extractLocationInfo(order, searchData);
  
  // Extract notes with better null checking
  const serviceNotes = extractNotes(order, searchData);
  const techNotes = completionForm.note || completionData.note || '';
  
  // Extract completion information with the enhanced extractor
  const { hasImages, signatureUrl, trackingUrl, completionStatus } = 
    extractCompletionInfo(completionForm, completionData);
  
  // Log completion details for debugging
  if (completionData) {
    logCompletionDetails(orderNo, completionStatus, trackingUrl, signatureUrl, hasImages);
  }

  // Generate a unique ID if one doesn't exist
  const id = order.id || order.orderId || `temp-${Math.random().toString(36).substring(2, 15)}`;
  
  // Generate a status based on completion status
  const status = !completionStatus ? 'imported' :
                completionStatus === 'success' ? 'completed' :
                completionStatus === 'failed' ? 'rejected' : 'imported';

  const result: WorkOrder = {
    id,
    order_no: orderNo,
    status,
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
    completion_response: order.completionDetails || order.completion_response || null
  };
  
  logTransformOutput(result);
  
  return result;
};
