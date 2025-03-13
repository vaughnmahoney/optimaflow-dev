
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!optimoRouteApiKey || !supabaseUrl || !supabaseKey) {
      console.error('Required environment variables not found');
      return new Response(
        JSON.stringify({ error: 'Server configuration error', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. First get the order details with correct format
    const searchResponse = await fetch(
      `https://api.optimoroute.com/v1/search_orders?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders: [{ orderNo: searchQuery }],
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

    // Get the first matching order
    const order = searchData.orders[0];

    // 2. Then get the completion details with correct format
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

    // 3. Store the data in Supabase
    const { data: workOrder, error: upsertError } = await supabase
      .from('work_orders')
      .upsert({
        order_no: searchQuery,
        search_response: order,
        completion_response: completionData,
        status: 'pending_review',
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error storing work order:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store work order', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 4. Return the work order ID along with the data
    return new Response(
      JSON.stringify({
        success: true,
        workOrderId: workOrder.id,
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
