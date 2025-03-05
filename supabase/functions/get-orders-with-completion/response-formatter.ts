
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
      }
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
