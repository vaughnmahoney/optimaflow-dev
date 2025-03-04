
import { corsHeaders } from "../../_shared/cors.ts";

// Format successful response with pagination info
export function formatSuccessResponse(
  combinedOrders: any[], 
  allCollectedOrders: any[], 
  searchData: any, 
  completionData: any,
  isComplete: boolean
) {
  // Deduplicate orders by order_no to prevent duplicate entries
  const orderMap = new Map();
  
  // First add all previously collected orders to the map
  if (Array.isArray(allCollectedOrders)) {
    allCollectedOrders.forEach(order => {
      if (order.order_no) {
        orderMap.set(order.order_no, order);
      }
    });
  }
  
  // Then add new orders, overwriting any duplicates with the latest version
  if (Array.isArray(combinedOrders)) {
    combinedOrders.forEach(order => {
      if (order.order_no) {
        orderMap.set(order.order_no, order);
      }
    });
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
  
  return new Response(
    JSON.stringify(response),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Format error response
export function formatErrorResponse(error: string, status: number = 500) {
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
