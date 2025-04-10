
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createErrorResponse, createSuccessResponse } from "../_shared/cors.ts";

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
      return createErrorResponse('Missing date parameters', 400);
    }
    
    const apiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
    if (!apiKey) {
      console.error('OptimoRoute API key not configured');
      return createErrorResponse('OptimoRoute API key not configured', 500);
    }
    
    // Create Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return createErrorResponse('Supabase configuration missing', 500);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`Fetching orders for date range: ${startDate} to ${endDate}`);
    
    try {
      // Make request to OptimoRoute search_orders API
      const response = await fetch('https://api.optimoroute.com/v1/search_orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
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
        return createErrorResponse(`OptimoRoute API error: ${response.status} - ${errorText}`, response.status);
      }
      
      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        console.error('Invalid response from OptimoRoute API');
        return createErrorResponse('Invalid response from OptimoRoute API', 500);
      }
      
      // Check for success field in response
      if (data.success !== true) {
        console.error('OptimoRoute API returned success: false', data);
        return createErrorResponse('OptimoRoute API returned unsuccessful response', 500);
      }
      
      // Check for orders field in response
      if (!Array.isArray(data.orders)) {
        console.error('OptimoRoute API response missing orders array', data);
        return createErrorResponse('OptimoRoute API response missing orders array', 500);
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
      return createSuccessResponse({
        totalOrders: data.orders.length,
        unscheduledOrders: unscheduledOrders.length,
        dateRange: {
          startDate,
          endDate
        },
        insertResult
      });
    } catch (fetchError) {
      console.error('Error fetching data from OptimoRoute:', fetchError);
      return createErrorResponse(`Error fetching data from OptimoRoute: ${fetchError.message}`, 500);
    }
    
  } catch (error) {
    console.error('Error in get-unscheduled-orders function:', error);
    return createErrorResponse(`An unexpected error occurred: ${error.message}`, 500);
  }
});
