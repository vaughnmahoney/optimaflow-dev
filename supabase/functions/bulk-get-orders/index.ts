
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

    console.log('Preparing request to OptimoRoute API');
    
    // Create the request body according to OptimoRoute API docs for search_orders
    const requestBody = {
      dateRange: {
        from: startDate,
        to: endDate,
      },
      includeOrderData: true,
      includeScheduleInformation: true
    };
    
    console.log('Request body:', JSON.stringify(requestBody));

    // Call OptimoRoute search_orders API with the proper date range format
    const bulkOrdersResponse = await fetch(
      `${baseUrl}/search_orders?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    console.log(`OptimoRoute API responded with status: ${bulkOrdersResponse.status}`);

    // Get the response text before trying to parse as JSON
    // This helps with debugging if the response isn't valid JSON
    const responseText = await bulkOrdersResponse.text();
    console.log('Raw API response:', responseText);
    
    let data;
    try {
      // Now parse the text as JSON
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Failed to parse response as JSON:', jsonError);
      return new Response(
        JSON.stringify({
          error: `Failed to parse OptimoRoute API response as JSON: ${responseText.substring(0, 200)}...`,
          success: false
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!bulkOrdersResponse.ok) {
      console.error('OptimoRoute API error:', bulkOrdersResponse.status, data);
      
      return new Response(
        JSON.stringify({
          error: `OptimoRoute API Error (${bulkOrdersResponse.status}): ${data.message || responseText}`,
          success: false
        }),
        { 
          status: bulkOrdersResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Check if data indicates success but returned no orders
    if (data.success === false) {
      console.log('API returned success:false. Error code:', data.code, 'Message:', data.message);
    } else {
      console.log('API call successful, retrieved orders:', data.orders?.length || 0);
    }
    
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
