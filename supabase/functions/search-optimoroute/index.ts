
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
    const requestData = await req.json();
    
    // Check if we have a single searchQuery or multiple orderNumbers
    const isBatchRequest = requestData.orderNumbers && Array.isArray(requestData.orderNumbers);
    const searchQuery = isBatchRequest ? null : requestData.searchQuery;
    const orderNumbers = isBatchRequest ? requestData.orderNumbers : null;
    
    console.log(isBatchRequest 
      ? `Received batch search request for ${orderNumbers.length} orders` 
      : `Received single search query: ${searchQuery}`);
    
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

    // Handle batch or single request appropriately
    if (isBatchRequest) {
      // BATCH REQUEST HANDLING
      return await handleBatchRequest(orderNumbers, optimoRouteApiKey, supabase, corsHeaders);
    } else {
      // SINGLE ORDER HANDLING
      return await handleSingleRequest(searchQuery, optimoRouteApiKey, supabase, corsHeaders);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

/**
 * Handle a batch request for multiple order numbers
 */
async function handleBatchRequest(orderNumbers, optimoRouteApiKey, supabase, corsHeaders) {
  if (!orderNumbers || !Array.isArray(orderNumbers) || orderNumbers.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No valid order numbers provided', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
  
  // Prepare orders array for the API request
  const ordersForRequest = orderNumbers.map(orderNo => ({ orderNo }));
  
  try {
    // 1. First get the order details with correct format
    // Build the URL with API key as query parameter
    const searchUrl = `https://api.optimoroute.com/v1/search_orders?key=${optimoRouteApiKey}`;
    
    const searchResponse = await fetch(
      searchUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders: ordersForRequest,
          includeOrderData: true,
          includeScheduleInformation: true
        })
      }
    );

    const searchData = await searchResponse.json();
    console.log(`Search response received for ${orderNumbers.length} orders. Found: ${searchData?.orders?.length || 0} orders`);
    
    // Check if we found any orders
    if (!searchData.orders || searchData.orders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No orders found', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // We don't need to get completion details for batch requests as they'll be fetched separately
    // Just return the search results
    return new Response(
      JSON.stringify({
        success: true,
        orders: searchData.orders
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing batch request:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

/**
 * Handle a single order search request
 */
async function handleSingleRequest(searchQuery, optimoRouteApiKey, supabase, corsHeaders) {
  if (!searchQuery || typeof searchQuery !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Invalid search query', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
  
  // Build the URL with API key as query parameter
  const searchUrl = `https://api.optimoroute.com/v1/search_orders?key=${optimoRouteApiKey}`;
  
  // 1. First get the order details with correct format
  const searchResponse = await fetch(
    searchUrl,
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
  // Build the URL with API key as query parameter
  const completionUrl = `https://api.optimoroute.com/v1/get_completion_details?key=${optimoRouteApiKey}`;
  
  const completionResponse = await fetch(
    completionUrl,
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

  // Extract driver name from scheduleInformation
  let driverName = null;
  if (order.scheduleInformation && typeof order.scheduleInformation === 'object') {
    driverName = order.scheduleInformation.driverName || null;
    console.log(`Extracted driver name from scheduleInformation: ${driverName}`);
  }

  // Extract location name from data.location
  let locationName = null;
  if (order.data && 
      typeof order.data === 'object' && 
      order.data.location && 
      typeof order.data.location === 'object') {
    locationName = order.data.location.locationName || null;
    console.log(`Extracted location name from data.location: ${locationName}`);
  }

  // 3. Store the data in Supabase
  const { data: workOrder, error: upsertError } = await supabase
    .from('work_orders')
    .upsert({
      order_no: searchQuery,
      search_response: order,
      completion_response: completionData,
      status: 'pending_review',
      timestamp: new Date().toISOString(),
      driver_name: driverName, // Store extracted driver name
      location_name: locationName // Store extracted location name
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
}
