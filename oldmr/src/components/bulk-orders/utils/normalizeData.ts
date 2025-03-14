
/**
 * Utilities for normalizing data structures from the API
 * Handles inconsistencies between camelCase and snake_case fields
 */

/**
 * Normalize completion data to a consistent structure
 * @param completionData Raw completion data from API
 * @returns Normalized completion data
 */
export const normalizeCompletionData = (completionDetails: any = {}): any => {
  if (!completionDetails) return null;
  
  // Handle different path structures for completion data
  let completionData: any = null;
  
  // Try different paths to find the completion data
  if (completionDetails.data) {
    // Direct data property
    completionData = completionDetails.data;
  } else if (completionDetails.orders && completionDetails.orders.length > 0) {
    // Through orders array (first item)
    completionData = completionDetails.orders[0].data;
  }
  
  if (!completionData) return null;
  
  // Normalize field names to camelCase
  return {
    status: completionData.status,
    startTime: completionData.startTime || completionData.start_time,
    endTime: completionData.endTime || completionData.end_time,
    trackingUrl: completionData.tracking_url || completionData.trackingUrl,
    form: completionData.form || {},
    note: completionData.note || completionData.form?.note || ''
  };
};

/**
 * Normalize images data from various possible structures
 * @param completionForm Form data from completion
 * @param completionData Full completion data
 * @returns Boolean indicating if images are present
 */
export const normalizeImageData = (completionForm: any = {}, completionData: any = {}): boolean => {
  // Check direct images array
  if (completionForm.images && Array.isArray(completionForm.images) && completionForm.images.length > 0) {
    return true;
  }
  
  // Check barcode scan images
  const hasBarcodeScanImages = (entries: any[]): boolean => {
    if (!entries || !Array.isArray(entries)) return false;
    
    return entries.some(entry => {
      const scanInfo = entry.scanInfo || entry.scan_info;
      return scanInfo?.images && Array.isArray(scanInfo.images) && scanInfo.images.length > 0;
    });
  };
  
  // Check various barcode image structures
  if (completionForm.barcode && hasBarcodeScanImages(completionForm.barcode)) {
    return true;
  }
  
  if (completionForm.barcode_collections && hasBarcodeScanImages(completionForm.barcode_collections)) {
    return true;
  }
  
  // Check direct flag or images on completionData
  if (completionData.hasImages) {
    return true;
  }
  
  if (completionData.images && Array.isArray(completionData.images) && completionData.images.length > 0) {
    return true;
  }
  
  return false;
};

/**
 * Normalize signature data from different possible paths
 * @param completionForm Form data from completion
 * @param completionData Full completion data
 * @returns Signature URL or null
 */
export const normalizeSignatureData = (completionForm: any = {}, completionData: any = {}): string | null => {
  // Check in various possible paths
  if (completionForm?.signature?.url) {
    return completionForm.signature.url;
  }
  
  if (completionData?.signature?.url) {
    return completionData.signature.url;
  }
  
  return null;
};
