
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
    console.log(`Fetching orders with completion data from ${startDate} to ${endDate}`);
    
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

    console.log('Step 1: Calling search_orders to get order numbers...');
    
    // STEP 1: Call search_orders to get all orders in date range
    const searchRequestBody = {
      dateRange: {
        from: startDate,
        to: endDate,
      },
      includeOrderData: true,
      includeScheduleInformation: true
    };
    
    const searchResponse = await fetch(
      `${baseUrl}/search_orders?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchRequestBody)
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('OptimoRoute search_orders error:', searchResponse.status, errorText);
      
      return new Response(
        JSON.stringify({
          error: `OptimoRoute search_orders API Error (${searchResponse.status}): ${errorText}`,
          success: false
        }),
        { 
          status: searchResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse search response
    const searchData = await searchResponse.json();
    console.log(`Found ${searchData.orders?.length || 0} orders in date range`);
    
    // If no orders found, return empty result
    if (!searchData.orders || searchData.orders.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          orders: [],
          totalCount: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // STEP 2: Extract order numbers and prepare for get_completion_details
    const orderNumbers = searchData.orders
      .filter(order => order?.data?.orderNo) // Make sure orderNo exists
      .map(order => ({ orderNo: order.data.orderNo }));
    
    console.log(`Step 2: Calling get_completion_details for ${orderNumbers.length} orders...`);
    
    // Check if we have any valid order numbers
    if (orderNumbers.length === 0) {
      console.log('No valid order numbers found in search results');
      return new Response(
        JSON.stringify({
          success: true,
          orders: searchData.orders, // Return search data even without completion details
          totalCount: searchData.orders.length,
          completionDetails: null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // STEP 3: Call get_completion_details with the order numbers
    const completionRequestBody = {
      orders: orderNumbers
    };
    
    const completionResponse = await fetch(
      `${baseUrl}/get_completion_details?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completionRequestBody)
      }
    );

    // Get the raw response for potential error analysis
    const completionResponseText = await completionResponse.text();
    
    let completionData;
    try {
      // Try to parse as JSON
      completionData = JSON.parse(completionResponseText);
    } catch (jsonError) {
      console.error('Failed to parse completion details response as JSON:', jsonError);
      completionData = { success: false, message: 'Invalid JSON response' };
    }

    if (!completionResponse.ok) {
      console.error('OptimoRoute get_completion_details error:', completionResponse.status, completionResponseText);
      
      // Continue with the process but flag the completion error
      completionData = {
        success: false,
        error: `API Error (${completionResponse.status}): ${completionResponseText.substring(0, 200)}...`
      };
    }

    // STEP 4: Combine the data
    console.log('Step 3: Combining search results with completion details...');
    
    // Create a map of orderNo to completion details for faster lookups
    const completionMap = new Map();
    
    if (completionData && completionData.success && completionData.orders) {
      completionData.orders.forEach(orderCompletion => {
        if (orderCompletion.orderNo) {
          completionMap.set(orderCompletion.orderNo, orderCompletion);
        }
      });
    }
    
    // Merge search data with completion data
    const combinedOrders = searchData.orders.map(searchOrder => {
      const orderNo = searchOrder.data?.orderNo;
      const completionInfo = orderNo ? completionMap.get(orderNo) : null;
      
      return {
        ...searchOrder,
        completionDetails: completionInfo || null
      };
    });

    // Prepare final response
    const response = {
      success: true,
      orders: combinedOrders,
      totalCount: combinedOrders.length,
      searchResponse: searchData,
      completionResponse: completionData
    };
    
    console.log(`Successfully combined data for ${combinedOrders.length} orders`);
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing order request:', error);
    
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
