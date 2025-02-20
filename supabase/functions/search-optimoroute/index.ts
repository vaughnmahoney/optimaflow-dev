
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

    // Validate inputs
    if (!searchQuery) {
      return new Response(
        JSON.stringify({ success: false, error: 'Search query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
    if (!optimoRouteApiKey) {
      console.error('OptimoRoute API key not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Service configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 1. Search OptimoRoute for order
    console.log('Fetching order details from OptimoRoute...');
    const searchResponse = await fetch('https://api.optimoroute.com/v1/search_orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: optimoRouteApiKey,
        query: searchQuery,
        includeOrderData: true,
        includeScheduleInformation: true
      })
    });

    const searchData = await searchResponse.json();
    console.log('Search response:', searchData);

    if (!searchResponse.ok) {
      console.error('OptimoRoute search failed:', searchResponse.status, searchData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to search OptimoRoute orders' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    if (!searchData.orders?.length) {
      return new Response(
        JSON.stringify({ success: false, error: 'No orders found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const order = searchData.orders[0];

    // 2. Get completion details
    console.log('Fetching completion details...');
    const completionResponse = await fetch('https://api.optimoroute.com/v1/get_completion_details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: optimoRouteApiKey,
        orderId: order.id
      })
    });

    const completionData = await completionResponse.json();
    console.log('Completion response:', completionData);

    if (!completionResponse.ok) {
      console.error('OptimoRoute completion details failed:', completionResponse.status, completionData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch completion details' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    // 3. Store in Supabase
    console.log('Storing data in Supabase...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ success: false, error: 'Database configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: existingOrder, error: checkError } = await supabase
      .from('work_orders')
      .select('id')
      .eq('order_no', searchQuery)
      .maybeSingle();

    if (checkError) {
      console.error('Database check failed:', checkError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database check failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    try {
      let workOrderId;
      if (existingOrder) {
        // Update existing order
        const { error: updateError } = await supabase
          .from('work_orders')
          .update({
            search_response: order,
            completion_response: completionData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingOrder.id);

        if (updateError) throw updateError;
        workOrderId = existingOrder.id;
      } else {
        // Insert new order
        const { data: newOrder, error: insertError } = await supabase
          .from('work_orders')
          .insert({
            order_no: searchQuery,
            search_response: order,
            completion_response: completionData,
            status: 'pending_review',
            timestamp: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        workOrderId = newOrder.id;
      }

      console.log('Successfully stored work order:', workOrderId);

      return new Response(
        JSON.stringify({
          success: true,
          workOrderId,
          orders: [order],
          completion_data: completionData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to store work order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
