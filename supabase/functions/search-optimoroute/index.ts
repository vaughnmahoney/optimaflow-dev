
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // 1. First get the order details
    const searchResponse = await fetch(
      `https://api.optimoroute.com/v1/search_orders?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders: [{ orderNo: searchQuery }]
          includeOrderData: true,
          includeScheduleInformation: true
        })
      }
    );

    const searchData = await searchResponse.json();
    console.log('Search response:', searchData);
    
    // Check if we found any orders
    if (!searchData.orders || searchData.orders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order not found', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Find the specific order from the search results
    const order = searchData.orders.find(order => order.order_no === searchQuery);
    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Specific order not found', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // 2. Then get the completion details using the found order's ID
    const completionResponse = await fetch(
      `https://api.optimoroute.com/v1/get_completion_details?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders: [{ orderNo: searchQuery }]
        })
      }
    );

    const completionData = await completionResponse.json();
    console.log('Completion data:', completionData);

    // 3. Combine the data
    return new Response(
      JSON.stringify({
        success: true,
        order: order,
        completion_data: completionData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
