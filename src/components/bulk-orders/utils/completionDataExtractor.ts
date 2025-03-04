
/**
 * Extracts completion information from order data
 */
export const extractCompletionInfo = (completionForm: any, completionData: any): {
  hasImages: boolean,
  signatureUrl: string | null,
  trackingUrl: string | null,
  completionStatus: string | null
} => {
  // Extract image information
  const hasImages = !!(
    completionForm.images && 
    completionForm.images.length > 0
  );
  
  // Handle signature information
  const signatureUrl = completionForm.signature?.url || null;
  
  // Extract tracking URL
  const trackingUrl = completionData.tracking_url || null;
  
  // Extract completion status
  const completionStatus = completionData.status || null;
  
  return {
    hasImages,
    signatureUrl,
    trackingUrl,
    completionStatus
  };
};
