
import { corsHeaders } from '../_shared/cors.ts';

const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
const baseUrl = 'https://api.optimoroute.com/v1';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate, endDate } = await req.json();
    console.log(`Fetching bulk orders from ${startDate} to ${endDate}`);
    
    if (!startDate || !endDate) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: startDate and endDate are required',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!optimoRouteApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'OptimoRoute API key is not configured',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Call OptimoRoute get_orders API with the proper request format
    // The API expects an "orders" array as per the documentation
    const bulkOrdersResponse = await fetch(
      `${baseUrl}/get_orders?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateFrom: startDate,
          dateTo: endDate,
          orders: [] // Empty array to fetch all orders in the date range
        })
      }
    );

    if (!bulkOrdersResponse.ok) {
      const errorText = await bulkOrdersResponse.text();
      console.error('OptimoRoute API error:', bulkOrdersResponse.status, errorText);
      
      return new Response(
        JSON.stringify({
          error: `OptimoRoute API Error (${bulkOrdersResponse.status}): ${errorText}`,
          success: false
        }),
        { 
          status: bulkOrdersResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await bulkOrdersResponse.json();
    console.log('Bulk orders successful response');
    
    return new Response(
      JSON.stringify({
        success: true,
        orders: data.orders || [],
        totalCount: data.orders?.length || 0,
        raw: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing bulk orders request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
