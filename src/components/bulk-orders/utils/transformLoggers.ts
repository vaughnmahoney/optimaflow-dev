
/**
 * Logs input order structure for debugging
 */
export const logInputOrderStructure = (order: any): void => {
  console.log("Transform input order structure:", JSON.stringify({
    id: order.id,
    orderNo: order.orderNo,
    searchResponse: order.searchResponse ? {
      success: order.searchResponse.success,
      data: order.searchResponse.data ? {
        orderNo: order.searchResponse.data.orderNo,
        date: order.searchResponse.data.date,
        driverInfo: order.searchResponse.data.driver,
        location: order.searchResponse.data.location,
      } : null,
      scheduleInformation: order.searchResponse.scheduleInformation
    } : null,
    completionDetails: order.completionDetails ? {
      success: order.completionDetails.success,
      orderNo: order.completionDetails.orderNo,
      status: order.completionDetails.data?.status,
      hasTrackingUrl: !!order.completionDetails.data?.tracking_url
    } : null
  }, null, 2));
};

/**
 * Logs order number for debugging
 */
export const logOrderNumber = (orderNo: string): void => {
  console.log("Found order number:", orderNo);
};

/**
 * Logs completion details for debugging
 */
export const logCompletionDetails = (orderNo: string, completionStatus: string | null, trackingUrl: string | null, signatureUrl: string | null, hasImages: boolean): void => {
  console.log(`Order ${orderNo} completion details:`, {
    status: completionStatus,
    hasTrackingUrl: !!trackingUrl,
    hasSignature: !!signatureUrl,
    hasImages
  });
};

/**
 * Logs transformation output for debugging
 */
export const logTransformOutput = (result: any): void => {
  console.log("Transform output:", {
    id: result.id,
    order_no: result.order_no,
    status: result.status,
    location: result.location.name,
    driver: result.driver.name,
    hasImages: result.has_images,
    hasTrackingUrl: !!result.tracking_url
  });
};
