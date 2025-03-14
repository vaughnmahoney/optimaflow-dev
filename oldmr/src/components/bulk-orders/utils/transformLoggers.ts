
/**
 * Logs input order structure for debugging
 */
export const logInputOrderStructure = (order: any): void => {
  console.log("Transform input order structure:", JSON.stringify({
    id: order.id,
    orderNo: order.orderNo || order.order_no,
    searchResponse: order.searchResponse ? {
      success: order.searchResponse.success,
      data: order.searchResponse.data ? {
        orderNo: order.searchResponse.data.orderNo,
        date: order.searchResponse.data.date,
        driverInfo: order.searchResponse.data.driver ? {
          id: order.searchResponse.data.driver.id,
          name: order.searchResponse.data.driver.name
        } : null,
        location: order.searchResponse.data.location ? {
          id: order.searchResponse.data.location.id,
          name: order.searchResponse.data.location.name
        } : null,
      } : null,
      scheduleInformation: !!order.searchResponse.scheduleInformation
    } : null,
    completionDetails: order.completionDetails ? {
      success: order.completionDetails.success,
      orderNo: order.completionDetails.orderNo,
      status: order.completionDetails.data?.status,
      hasStartTime: !!order.completionDetails.data?.startTime,
      hasEndTime: !!order.completionDetails.data?.endTime,
      hasTrackingUrl: !!order.completionDetails.data?.tracking_url,
      hasForm: !!order.completionDetails.data?.form
    } : null,
    // Add raw structure logging
    rawStructure: {
      hasId: !!order.id,
      hasOrderNo: !!order.orderNo || !!order.order_no,
      hasSearchResponse: !!order.searchResponse,
      hasCompletionDetails: !!order.completionDetails,
      topLevelKeys: Object.keys(order)
    }
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
    hasImages,
    // Add raw structure logging
    rawStatus: completionStatus
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
    location: result.location?.name || "N/A",
    driver: result.driver?.name || "N/A",
    hasImages: result.has_images,
    hasTrackingUrl: !!result.tracking_url,
    serviceDate: result.service_date,
    completionStatus: result.completion_status,
    // Add full response structure for debugging
    structure: {
      hasSearchResponse: !!result.search_response,
      hasCompletionResponse: !!result.completion_response,
      completionResponseSuccess: result.completion_response?.success,
      completionResponseHasOrders: Array.isArray(result.completion_response?.orders),
      completionResponseOrdersCount: result.completion_response?.orders?.length || 0
    }
  });
};

/**
 * Logs the API response structure in detail
 */
export const logApiResponseStructure = (response: any): void => {
  console.log("API Response Structure:", JSON.stringify({
    success: response?.success,
    hasOrders: !!response?.orders,
    ordersCount: response?.orders?.length || 0,
    totalCount: response?.totalCount || 0,
    hasPaginationProgress: !!response?.paginationProgress,
    paginationProgress: response?.paginationProgress,
    hasAfterTag: !!response?.after_tag,
    hasSearchResponse: !!response?.searchResponse,
    hasCompletionResponse: !!response?.completionResponse,
    searchResponseSuccess: response?.searchResponse?.success,
    completionResponseSuccess: response?.completionResponse?.success,
    // Sample the first order if available
    firstOrderSample: response?.orders && response?.orders.length > 0 ? {
      id: response.orders[0].id,
      orderNo: response.orders[0].orderNo || response.orders[0].order_no,
      hasSearchResponse: !!response.orders[0].searchResponse,
      hasCompletionDetails: !!response.orders[0].completionDetails,
      keys: Object.keys(response.orders[0]),
      completionDetailsStructure: response.orders[0].completionDetails ? {
        success: response.orders[0].completionDetails.success,
        hasData: !!response.orders[0].completionDetails.data,
        dataStatus: response.orders[0].completionDetails.data?.status,
        dataKeys: response.orders[0].completionDetails.data ? Object.keys(response.orders[0].completionDetails.data) : []
      } : null
    } : null
  }, null, 2));
};

/**
 * Logs detailed filter criteria for debugging
 */
export const logFilterDetails = (order: any, passedFilter: boolean, reason?: string): void => {
  if (!passedFilter) {
    console.log(`Order ${order.orderNo || order.order_no || order.id} filtered out: ${reason}`, {
      id: order.id,
      orderNo: order.orderNo || order.order_no,
      hasCompletionDetails: !!order.completionDetails,
      completionSuccess: order.completionDetails?.success,
      hasCompletionData: !!order.completionDetails?.data,
      completionStatus: order.completionDetails?.data?.status,
      hasStartTime: !!order.completionDetails?.data?.startTime,
      hasEndTime: !!order.completionDetails?.data?.endTime,
      dataKeys: order.completionDetails?.data ? Object.keys(order.completionDetails.data) : []
    });
  }
};
