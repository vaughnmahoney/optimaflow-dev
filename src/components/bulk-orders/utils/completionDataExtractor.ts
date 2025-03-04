
/**
 * Extracts completion information from the order data
 * @param completionForm The form data from completion details
 * @param completionData The completion data object
 * @returns Object with extracted completion information
 */
export const extractCompletionInfo = (
  completionForm: any = {}, 
  completionData: any = {}
): { 
  hasImages: boolean; 
  signatureUrl: string | null; 
  trackingUrl: string | null; 
  completionStatus: string | null; 
} => {
  // Extract completion status
  const completionStatus = completionData.status || null;
  
  // Extract tracking URL
  const trackingUrl = completionData.tracking_url || null;
  
  // Extract signature URL - check both possible locations
  let signatureUrl = null;
  if (completionForm.signature && completionForm.signature.url) {
    signatureUrl = completionForm.signature.url;
  } else if (completionData.signature && completionData.signature.url) {
    signatureUrl = completionData.signature.url;
  }
  
  // Check for images - handle different possible structures
  let hasImages = false;
  
  // Check if form has images array
  if (completionForm.images && Array.isArray(completionForm.images) && completionForm.images.length > 0) {
    hasImages = true;
  }
  
  // Check barcode images
  if (!hasImages && completionForm.barcode && Array.isArray(completionForm.barcode)) {
    // Look for any barcode entry that has images
    hasImages = completionForm.barcode.some(entry => 
      entry.scanInfo && 
      entry.scanInfo.images && 
      Array.isArray(entry.scanInfo.images) && 
      entry.scanInfo.images.length > 0
    );
  }
  
  // Check barcode_collections images
  if (!hasImages && completionForm.barcode_collections && Array.isArray(completionForm.barcode_collections)) {
    // Look for any barcode_collections entry that has images
    hasImages = completionForm.barcode_collections.some(entry => 
      entry.scanInfo && 
      entry.scanInfo.images && 
      Array.isArray(entry.scanInfo.images) && 
      entry.scanInfo.images.length > 0
    );
  }
  
  return {
    hasImages,
    signatureUrl,
    trackingUrl,
    completionStatus
  };
};
