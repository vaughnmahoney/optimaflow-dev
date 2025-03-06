
import { corsHeaders } from '../_shared/cors.ts';

// Format a success response with all required data
export function formatSuccessResponse(
  orders: any[],
  filteringMetadata: {
    unfilteredOrderCount: number;
    filteredOrderCount: number;
    completionDetailCount: number;
  },
  isComplete: boolean
) {
  // Include complete raw data samples in the response for debugging
  const rawDataSamples = {
    searchSample: orders.length > 0 ? orders[0] : null,
    completionSample: orders.length > 0 && orders[0].completionDetails ? orders[0].completionDetails : null
  };
  
  console.log("Response formatter metadata:", JSON.stringify({
    totalOrdersCount: orders.length,
    unfilteredCount: filteringMetadata.unfilteredOrderCount,
    filteredCount: filteringMetadata.filteredOrderCount,
    completionDetailCount: filteringMetadata.completionDetailCount,
    isComplete
  }, null, 2));
  
  // Create response data object
  const responseData = {
    success: true,
    orders,
    totalCount: filteringMetadata.unfilteredOrderCount,
    filteredCount: filteringMetadata.filteredOrderCount,
    isComplete,
    rawDataSamples,
    filteringMetadata
  };
  
  // Return both the data object and a formatted Response object
  return {
    data: responseData,
    response: new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  };
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
