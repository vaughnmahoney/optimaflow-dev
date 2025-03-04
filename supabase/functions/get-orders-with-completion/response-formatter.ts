
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
  const totalOrders = orders.length;
  const ordersWithCompletion = orders.filter(o => !!o.completion_response).length;
  
  // Create pagination progress information
  const paginationProgress = {
    isComplete,
    afterTag: searchData.after_tag || null,
    totalCollected: orders.length,
    previouslyCollected: previousOrders.length
  };
  
  console.log(`Formatting success response: ${totalOrders} total orders, ${ordersWithCompletion} with completion data`);
  console.log(`Pagination complete: ${isComplete}`);
  
  return new Response(
    JSON.stringify({
      success: true,
      orders,
      totalCount: totalOrders,
      filteredCount: ordersWithCompletion,
      after_tag: searchData.after_tag || null,
      paginationProgress
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
