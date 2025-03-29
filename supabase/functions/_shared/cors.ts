
// Define CORS headers for all edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a standard error response with CORS headers
export const createErrorResponse = (message: string, status: number = 400) => {
  return new Response(
    JSON.stringify({
      success: false,
      error: message
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
};

// Create a standard success response with CORS headers
export const createSuccessResponse = (data: any, meta: any = null) => {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...meta && { meta }
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
};
