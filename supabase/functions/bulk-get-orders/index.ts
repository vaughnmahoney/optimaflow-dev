
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  startDate: string;
  endDate: string;
  includeOrderData: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { startDate, endDate, includeOrderData } = await req.json() as RequestBody;
    
    if (!startDate) {
      return new Response(
        JSON.stringify({ error: 'Start date is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Get API key from environment
    const apiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Construct the request to OptimoRoute
    const apiUrl = 'https://api.optimoroute.com/v1/get_orders_bulk';
    const requestBody = {
      key: apiKey,
      date_start: startDate,
      date_end: endDate || startDate,
      include_order_data: includeOrderData,
      offset: 0,
      limit: 100, // Default limit, could be parameterized
    };
    
    console.log(`Fetching orders from ${startDate} to ${endDate || startDate}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OptimoRoute API error: ${data.error || response.statusText}`);
    }
    
    return new Response(
      JSON.stringify(data.orders || []),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in bulk-get-orders function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
