
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Updated CORS headers to match what the API expects
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { searchQuery } = await req.json();
    console.log('Received search query:', searchQuery);
    
    const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
    if (!optimoRouteApiKey) {
      console.error('OptimoRoute API key not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Make request to OptimoRoute API
    const searchResponse = await fetch('https://api.optimoroute.com/v1/search_orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: optimoRouteApiKey,
        query: searchQuery,
        includeOrderData: true,
        includeScheduleInformation: true
      })
    });

    const searchData = await searchResponse.json();
    console.log('OptimoRoute API Response:', {
      status: searchResponse.status,
      headers: Object.fromEntries(searchResponse.headers),
      data: searchData
    });

    if (!searchResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch from OptimoRoute', 
          details: searchData,
          success: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: searchResponse.status }
      );
    }

    // Check if we found any orders
    if (!searchData.orders || searchData.orders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No orders found', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get the first order's ID
    const workOrderId = searchData.orders[0].id;

    return new Response(
      JSON.stringify({
        success: true,
        workOrderId,
        orders: searchData.orders
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-optimoroute function:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
