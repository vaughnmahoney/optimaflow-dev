
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
    console.log('Starting orders fetch...');
    
    // Parse request body to get date range
    const body = await req.json();
    const { startDate, endDate } = body;
    
    if (!startDate || !endDate) {
      console.error('Missing date parameters');
      return createErrorResponse('Missing date parameters', 400);
    }
    
    // Get API key from environment variables
    const apiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
    if (!apiKey) {
      console.error('OptimoRoute API key not configured');
      return createErrorResponse('OptimoRoute API key not configured', 500);
    }
    
    console.log(`Fetching orders for date range: ${startDate} to ${endDate}`);
    console.log(`Using API key: ${apiKey ? 'FOUND (key exists)' : 'MISSING'}`);
    
    try {
      // Make request to OptimoRoute search_orders API
      // According to OptimoRoute docs, we need to pass the key in the request body
      const response = await fetch('https://api.optimoroute.com/v1/search_orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: apiKey,
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
        return createErrorResponse(`OptimoRoute API error: ${data.message || 'Unknown error'}`, 500);
      }
      
      // Check for orders field in response
      if (!Array.isArray(data.orders)) {
        console.error('OptimoRoute API response missing orders array', data);
        return createErrorResponse('OptimoRoute API response missing orders array', 500);
      }
      
      console.log(`Retrieved ${data.orders.length} orders total`);
      
      // Return all orders from the API without filtering
      return createSuccessResponse({
        totalOrders: data.orders.length,
        dateRange: {
          startDate,
          endDate
        },
        orders: data.orders
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
