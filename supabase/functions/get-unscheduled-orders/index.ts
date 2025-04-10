
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting unscheduled orders fetch...');
    
    // Parse request body to get date range
    const body = await req.json();
    const { startDate, endDate } = body;
    
    if (!startDate || !endDate) {
      console.error('Missing date parameters');
      return new Response(
        JSON.stringify({ error: 'Missing date parameters', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const apiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
    if (!apiKey) {
      console.error('OptimoRoute API key not configured');
      return new Response(
        JSON.stringify({ error: 'OptimoRoute API key not configured', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`Fetching orders for date range: ${startDate} to ${endDate}`);
    
    // Make request to OptimoRoute search_orders API
    const response = await fetch('https://api.optimoroute.com/v1/search_orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRange: {
          from: startDate,
          to: endDate
        },
        includeOrderData: true,
        includeScheduleInformation: true
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OptimoRoute API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `OptimoRoute API error: ${errorText}` 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    
    if (!data.success || !data.orders) {
      console.error('Invalid response from OptimoRoute API');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid response from OptimoRoute API' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Retrieved ${data.orders.length} orders total`);
    
    // Process the data to identify unscheduled orders
    const unscheduledOrders = data.orders.filter(order => order.scheduleInformation === null);
    console.log(`Found ${unscheduledOrders.length} unscheduled orders`);
    
    // Map to format needed for database insert
    const ordersToInsert = unscheduledOrders.map(order => {
      return {
        order_id: order.id,
        order_no: order.data?.orderNo || 'unknown',
        date: order.data?.date || null,
        location_name: order.data?.location?.locationName || null,
        test: 'unscheduled', // Set test column value to "unscheduled"
        data: order
      };
    });
    
    // Insert into test table
    let insertResult;
    if (ordersToInsert.length > 0) {
      console.log(`Inserting ${ordersToInsert.length} orders into test_orders table`);
      
      // Upsert orders into the test_orders table (will create or update based on order_id)
      const { data: insertedData, error: insertError } = await supabase
        .from('test_orders')
        .upsert(ordersToInsert, { 
          onConflict: 'order_id',
          ignoreDuplicates: false
        });
      
      if (insertError) {
        console.error('Error inserting data:', insertError);
        insertResult = {
          success: false,
          error: insertError.message
        };
      } else {
        console.log('Successfully inserted data');
        insertResult = {
          success: true,
          count: ordersToInsert.length
        };
      }
    } else {
      console.log('No unscheduled orders to insert');
      insertResult = {
        success: true,
        count: 0
      };
    }
    
    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        totalOrders: data.orders.length,
        unscheduledOrders: unscheduledOrders.length,
        dateRange: {
          startDate,
          endDate
        },
        insertResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in get-unscheduled-orders function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
