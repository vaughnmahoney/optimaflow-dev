
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
  console.log("Extracting completion info from:", {
    formKeys: completionForm ? Object.keys(completionForm) : [],
    dataKeys: completionData ? Object.keys(completionData) : []
  });
  
  // Extract completion status - check both camelCase and snake_case
  const completionStatus = 
    completionData.status || 
    completionData.completion_status ||
    null;
  
  // Extract tracking URL - check both camelCase and snake_case
  const trackingUrl = 
    completionData.tracking_url || 
    completionData.trackingUrl || 
    null;
  
  // Extract signature URL - check both forms and all possible paths
  let signatureUrl = null;
  
  // Check in form object
  if (completionForm?.signature?.url) {
    signatureUrl = completionForm.signature.url;
  } 
  // Check in snake_case version
  else if (completionForm?.signature?.url) {
    signatureUrl = completionForm.signature.url;
  }
  // Check directly in data object
  else if (completionData?.signature?.url) {
    signatureUrl = completionData.signature.url;
  }
  // Check snake_case in data object
  else if (completionData?.signature?.url) {
    signatureUrl = completionData.signature.url;
  }
  
  // Check for images - handle different possible structures
  let hasImages = false;
  
  // Log detailed image detection for debugging
  console.log("Image detection for", completionData.orderNo || completionData.order_no || "unknown order", {
    hasForm: !!completionForm,
    hasImages: !!completionForm.images,
    isImagesArray: completionForm.images && Array.isArray(completionForm.images),
    imagesLength: completionForm.images && Array.isArray(completionForm.images) ? completionForm.images.length : 0,
    hasBarcode: !!completionForm.barcode,
    hasBarcodeCollections: !!completionForm.barcode_collections
  });
  
  // Check if form has images array
  if (completionForm.images && Array.isArray(completionForm.images) && completionForm.images.length > 0) {
    hasImages = true;
    console.log("Found images directly in form.images array");
  }
  
  // Check both camelCase and snake_case versions
  const checkBarcodeEntries = (entries: any[]): boolean => {
    if (!entries || !Array.isArray(entries)) return false;
    
    return entries.some(entry => {
      // Check for scan_info (snake_case) or scanInfo (camelCase)
      const scanInfo = entry.scanInfo || entry.scan_info;
      if (!scanInfo) return false;
      
      // Check for images array in scan_info
      return scanInfo.images && 
             Array.isArray(scanInfo.images) && 
             scanInfo.images.length > 0;
    });
  };
  
  // Check barcode images (camelCase)
  if (!hasImages && completionForm.barcode) {
    hasImages = checkBarcodeEntries(completionForm.barcode);
    if (hasImages) console.log("Found images in barcode.scanInfo.images");
  }
  
  // Check barcode_collections images (snake_case)
  if (!hasImages && completionForm.barcode_collections) {
    hasImages = checkBarcodeEntries(completionForm.barcode_collections);
    if (hasImages) console.log("Found images in barcode_collections.scan_info.images");
  }
  
  // For cases where images might be in a different structure
  if (!hasImages && completionData.hasImages) {
    hasImages = true;
    console.log("Using direct hasImages flag from completionData");
  }
  
  // Check for images directly attached to completionData
  if (!hasImages && completionData.images && Array.isArray(completionData.images) && completionData.images.length > 0) {
    hasImages = true;
    console.log("Found images directly in completionData.images");
  }
  
  return {
    hasImages,
    signatureUrl,
    trackingUrl,
    completionStatus
  };
};
