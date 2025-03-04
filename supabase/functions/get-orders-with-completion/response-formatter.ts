
import { corsHeaders } from "../_shared/cors.ts";

// Format successful response with pagination info
export function formatSuccessResponse(
  combinedOrders: any[], 
  allCollectedOrders: any[], 
  searchData: any, 
  completionData: any,
  isComplete: boolean
) {
  console.log("Response formatter input:", {
    combinedOrdersCount: combinedOrders.length,
    allCollectedOrdersCount: allCollectedOrders.length,
    searchDataOrdersCount: searchData.orders?.length,
    completionDataOrdersCount: completionData?.orders?.length,
    isComplete
  });
  
  // Log detailed structure of searchData for debugging
  console.log("SEARCH DATA STRUCTURE:", JSON.stringify({
    success: searchData.success,
    ordersCount: searchData.orders?.length,
    firstOrderSample: searchData.orders && searchData.orders.length > 0 ? {
      id: searchData.orders[0].id,
      orderNo: searchData.orders[0].orderNo,
      date: searchData.orders[0].date,
      hasDriver: !!searchData.orders[0].driver,
      hasLocation: !!searchData.orders[0].location,
      status: searchData.orders[0].status,
      keys: Object.keys(searchData.orders[0])
    } : null,
    hasAfterTag: !!searchData.after_tag,
    afterTag: searchData.after_tag
  }, null, 2));
  
  // Log detailed structure of completionData for debugging
  if (completionData) {
    console.log("COMPLETION DATA STRUCTURE:", JSON.stringify({
      success: completionData.success,
      ordersCount: completionData.orders?.length,
      firstOrderSample: completionData.orders && completionData.orders.length > 0 ? {
        id: completionData.orders[0].id,
        orderNo: completionData.orders[0].orderNo,
        status: completionData.orders[0].status,
        hasData: !!completionData.orders[0].data,
        dataKeys: completionData.orders[0].data ? Object.keys(completionData.orders[0].data) : [],
        dataStatus: completionData.orders[0].data?.status,
        hasStartTime: !!completionData.orders[0].data?.startTime,
        hasEndTime: !!completionData.orders[0].data?.endTime,
        hasTrackingUrl: !!completionData.orders[0].data?.tracking_url,
        hasForm: !!completionData.orders[0].data?.form
      } : null
    }, null, 2));
  }
  
  // Log combined order structure for debugging
  console.log("COMBINED ORDER STRUCTURE:", JSON.stringify({
    ordersCount: combinedOrders.length,
    firstOrderSample: combinedOrders.length > 0 ? {
      id: combinedOrders[0].id,
      orderNo: combinedOrders[0].orderNo,
      hasSearchResponse: !!combinedOrders[0].searchResponse,
      hasCompletionDetails: !!combinedOrders[0].completionDetails,
      keys: Object.keys(combinedOrders[0]),
      searchResponseKeys: combinedOrders[0].searchResponse ? Object.keys(combinedOrders[0].searchResponse) : [],
      completionDetailsKeys: combinedOrders[0].completionDetails ? Object.keys(combinedOrders[0].completionDetails) : []
    } : null
  }, null, 2));
  
  // Deduplicate orders by order_no to prevent duplicate entries
  const orderMap = new Map();
  
  // First add all previously collected orders to the map
  if (Array.isArray(allCollectedOrders)) {
    allCollectedOrders.forEach(order => {
      if (order.order_no) {
        orderMap.set(order.order_no, order);
      }
    });
    console.log(`Added ${allCollectedOrders.length} previously collected orders to orderMap`);
  }
  
  // Then add new orders, overwriting any duplicates with the latest version
  if (Array.isArray(combinedOrders)) {
    let overwrittenCount = 0;
    combinedOrders.forEach(order => {
      if (order.order_no) {
        if (orderMap.has(order.order_no)) {
          overwrittenCount++;
        }
        orderMap.set(order.order_no, order);
      }
    });
    console.log(`Added ${combinedOrders.length} new orders to orderMap, overwrote ${overwrittenCount} duplicates`);
  }
  
  // Convert the map back to an array
  const deduplicatedOrders = Array.from(orderMap.values());
  console.log(`Deduplicated ${combinedOrders.length} orders to ${deduplicatedOrders.length} unique orders`);
  
  const currentPage = allCollectedOrders.length > 0 ? 
    Math.ceil(allCollectedOrders.length / 500) + 1 : 1;
  
  // Prepare pagination progress information
  const paginationProgress = {
    currentPage,
    totalOrdersRetrieved: deduplicatedOrders.length,
    isComplete,
    // Store after_tag in our internal camelCase format if present
    afterTag: searchData.after_tag || undefined
  };
  
  // Prepare response
  const response = {
    success: true,
    orders: deduplicatedOrders,
    totalCount: deduplicatedOrders.length,
    paginationProgress,
    searchResponse: searchData,
    completionResponse: completionData
  };
  
  // Include original after_tag from API if present
  if (searchData.after_tag) {
    response.after_tag = searchData.after_tag;
  }
  
  console.log("Final response structure:", {
    success: response.success,
    ordersCount: response.orders.length,
    totalCount: response.totalCount,
    paginationProgress: response.paginationProgress,
    hasAfterTag: !!response.after_tag
  });
  
  return new Response(
    JSON.stringify(response),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Format error response
export function formatErrorResponse(error: string, status: number = 500) {
  console.error(`Formatting error response: ${error}, status: ${status}`);
  return new Response(
    JSON.stringify({ 
      error: error,
      success: false 
    }),
    { 
      status: status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
