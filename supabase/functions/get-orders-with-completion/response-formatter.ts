
import { corsHeaders } from '../_shared/cors.ts';

/**
 * Formats a successful response with the given data
 */
export function formatSuccessResponse(
  orders: any[],
  filteringMetadata: {
    unfilteredOrderCount: number,
    filteredOrderCount: number,
    completionDetailCount: number
  },
  isComplete: boolean = true,
  continuationToken: string | null = null,
  currentPage: number = 1,
  totalPages: number | null = null
) {
  const data = {
    success: true,
    message: "Orders retrieved successfully",
    orders,
    totalOrders: orders.length,
    filteringMetadata,
    isComplete,
    continuationToken,
    currentPage,
    totalPages
  };

  const response = new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  );

  return { data, response };
}

/**
 * Formats an error response with the given message
 */
export function formatErrorResponse(
  message: string,
  status: number = 500
) {
  const data = {
    success: false,
    message,
    error: message
  };

  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  );
}
