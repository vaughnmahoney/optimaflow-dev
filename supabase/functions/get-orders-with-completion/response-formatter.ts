
import { corsHeaders } from '../_shared/cors.ts';

// Format a success response with all required data
export function formatSuccessResponse(
  orders: any[],
  previousOrders: any[],
  searchData: any,
  completionData: any | null,
  isComplete: boolean
) {
  // Calculate stats about the results
  const totalOrders = searchData.orders?.length || 0;
  const filteredOrders = orders.length;
  
  // Create pagination progress information
  const paginationProgress = {
    isComplete,
    afterTag: searchData.after_tag || null,
    totalCollected: orders.length,
    previouslyCollected: previousOrders.length
  };
  
  // Add detailed logging of the first order to help with debugging
  if (searchData.orders && searchData.orders.length > 0) {
    console.log("First search order sample:", JSON.stringify(searchData.orders[0], null, 2).substring(0, 500) + "...");
  }
  
  if (completionData && completionData.orders && completionData.orders.length > 0) {
    console.log("First completion sample:", JSON.stringify(completionData.orders[0], null, 2).substring(0, 500) + "...");
  }
  
  // Include raw data samples in the response for debugging
  const rawDataSamples = {
    searchSample: searchData.orders && searchData.orders.length > 0 ? searchData.orders[0] : null,
    completionSample: completionData && completionData.orders && completionData.orders.length > 0 ? 
      completionData.orders[0] : null
  };
  
  console.log("Response formatter input:", JSON.stringify({
    filteredOrdersCount: filteredOrders,
    totalOrdersCount: totalOrders,
    previousOrdersCount: previousOrders.length,
    searchDataOrdersCount: searchData.orders?.length || 0,
    completionDataOrdersCount: completionData?.orders?.length || 0,
    isComplete
  }, null, 2));
  
  return new Response(
    JSON.stringify({
      success: true,
      orders,
      totalCount: totalOrders,
      filteredCount: filteredOrders,
      after_tag: searchData.after_tag || null,
      paginationProgress,
      filteringMetadata: {
        unfilteredOrderCount: searchData.orders?.length || 0,
        filteredOrderCount: filteredOrders,
        completionDetailCount: completionData?.orders?.length || 0
      },
      rawDataSamples // Include raw data samples for debugging
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Format an error response with proper status code
export function formatErrorResponse(error: string, status: number = 500) {
  console.error(`Formatting error response: ${error}`);
  
  return new Response(
    JSON.stringify({ 
      error,
      success: false 
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
