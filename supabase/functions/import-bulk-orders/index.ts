
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// Create a Supabase client with the admin role
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orders } = await req.json();
    
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No valid orders provided',
          imported: 0,
          duplicates: 0,
          errors: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${orders.length} orders for import...`);
    
    // Track results
    const results = {
      success: false,
      total: orders.length,
      imported: 0,
      duplicates: 0,
      errors: 0,
      errorDetails: []
    };

    // Process orders - since client is now batching, we don't need to batch here anymore
    // but we'll keep processing one at a time to avoid overwhelming the database
    for (const order of orders) {
      try {
        // Extract unique identifier (order_no) from various possible locations
        const orderNo = order.order_no || 
                      order.data?.orderNo || 
                      (order.searchResponse && order.searchResponse.data?.orderNo) ||
                      (order.completionDetails && order.completionDetails.orderNo) || 
                      'unknown';
        
        // Check if order already exists by order_no
        const { data: existingOrders, error: checkError } = await adminClient
          .from('work_orders')
          .select('id')
          .eq('order_no', orderNo)
          .maybeSingle();
        
        if (checkError) {
          throw new Error(`Error checking for existing order: ${checkError.message}`);
        }
        
        // If order already exists, count as duplicate and skip
        if (existingOrders) {
          results.duplicates++;
          continue;
        }

        // Extract driver_name from scheduleInformation (following the JSON path)
        let driverName = null;
        // Check in scheduleInformation (direct)
        if (order.scheduleInformation && typeof order.scheduleInformation === 'object') {
          driverName = order.scheduleInformation.driverName;
          console.log(`Found driver name in direct scheduleInformation: ${driverName}`);
        } 
        // Check in searchResponse.scheduleInformation
        else if (order.searchResponse && typeof order.searchResponse === 'object' && 
                order.searchResponse.scheduleInformation && typeof order.searchResponse.scheduleInformation === 'object') {
          driverName = order.searchResponse.scheduleInformation.driverName;
          console.log(`Found driver name in searchResponse.scheduleInformation: ${driverName}`);
        }
        // Check in search_response.scheduleInformation (snake_case version)
        else if (order.search_response && typeof order.search_response === 'object' && 
                order.search_response.scheduleInformation && typeof order.search_response.scheduleInformation === 'object') {
          driverName = order.search_response.scheduleInformation.driverName;
          console.log(`Found driver name in search_response.scheduleInformation: ${driverName}`);
        }
        
        // Extract location_name from data.location (following the JSON path)
        let locationName = null;
        // Check in direct data.location
        if (order.data && typeof order.data === 'object' && 
            order.data.location && typeof order.data.location === 'object') {
          locationName = order.data.location.locationName;
          console.log(`Found location name in direct data.location: ${locationName}`);
        }
        // Check in searchResponse.data.location
        else if (order.searchResponse && typeof order.searchResponse === 'object' &&
                order.searchResponse.data && typeof order.searchResponse.data === 'object' && 
                order.searchResponse.data.location && typeof order.searchResponse.data.location === 'object') {
          locationName = order.searchResponse.data.location.locationName;
          console.log(`Found location name in searchResponse.data.location: ${locationName}`);
        } 
        // Check in search_response.data.location (snake_case version)
        else if (order.search_response && typeof order.search_response === 'object' &&
                order.search_response.data && typeof order.search_response.data === 'object' &&  
                order.search_response.data.location && typeof order.search_response.data.location === 'object') {
          locationName = order.search_response.data.location.locationName;
          console.log(`Found location name in search_response.data.location: ${locationName}`);
        }
        
        // Extract end_time from various possible locations
        let endTime = null;
        
        // First check completion_response
        if (order.completion_response && typeof order.completion_response === 'object') {
          if (order.completion_response.orders && 
              Array.isArray(order.completion_response.orders) && 
              order.completion_response.orders[0]) {
            const completionOrder = order.completion_response.orders[0];
            // Try to get end_time from completion_response.orders[0].data.endTime
            if (completionOrder.data && completionOrder.data.endTime) {
              const timeData = completionOrder.data.endTime;
              if (timeData.localTime) {
                endTime = new Date(timeData.localTime).toISOString();
              }
            }
          }
        }
        
        // Next check completionDetails
        if (!endTime && order.completionDetails && typeof order.completionDetails === 'object') {
          // Try to get end_time from completionDetails.data.endTime
          if (order.completionDetails.data && order.completionDetails.data.endTime) {
            const timeData = order.completionDetails.data.endTime;
            if (timeData.localTime) {
              endTime = new Date(timeData.localTime).toISOString();
            }
          }
        }
        
        // If we still don't have end_time, try to fallback on service_date
        if (!endTime) {
          const serviceDate = order.service_date || 
                           (order.data && order.data.date) ||
                           (order.searchResponse && order.searchResponse.data && order.searchResponse.data.date);
          
          if (serviceDate) {
            // We don't have a time component, so use end of day for sorting purposes
            endTime = new Date(`${serviceDate}T23:59:59Z`).toISOString();
          }
        }

        // Extract optimoroute_status from various sources
        let optimoRouteStatus = null;
        
        // First check completion_response
        if (order.completion_response && typeof order.completion_response === 'object') {
          if (order.completion_response.orders && 
              Array.isArray(order.completion_response.orders) && 
              order.completion_response.orders[0]) {
            const completionOrder = order.completion_response.orders[0];
            if (completionOrder.data && completionOrder.data.status) {
              optimoRouteStatus = completionOrder.data.status;
            }
          }
          // Direct data property
          else if (order.completion_response.data && order.completion_response.data.status) {
            optimoRouteStatus = order.completion_response.data.status;
          }
        }
        
        // Next check completionDetails if we didn't find it yet
        if (!optimoRouteStatus && order.completionDetails && typeof order.completionDetails === 'object') {
          if (order.completionDetails.data && order.completionDetails.data.status) {
            optimoRouteStatus = order.completionDetails.data.status;
          }
        }

        console.log(`Extracted data for ${orderNo}: driver=${driverName}, location=${locationName}, endTime=${endTime}, optimoRouteStatus=${optimoRouteStatus}`);
        
        // Transform order to match work_orders table schema
        const workOrder = {
          order_no: orderNo,
          status: 'pending_review', // Default status for imported orders
          timestamp: new Date().toISOString(),
          end_time: endTime, // Store extracted end_time
          driver_name: driverName, // Add the extracted driver name
          location_name: locationName, // Add the extracted location name
          optimoroute_status: optimoRouteStatus, // Add the extracted optimoroute_status
          search_response: order.search_response || order, // Store original search data
          completion_response: order.completion_response || order.completionDetails || null // Store completion data if available
        };
        
        // Insert the order into the database
        const { error: insertError } = await adminClient
          .from('work_orders')
          .insert(workOrder);
        
        if (insertError) {
          throw new Error(`Error inserting order: ${insertError.message}`);
        }
        
        results.imported++;
        
      } catch (orderError) {
        console.error(`Error processing order:`, orderError);
        results.errors++;
        results.errorDetails.push(orderError.message);
      }
    }
    
    results.success = results.errors === 0;
    
    console.log(`Import complete. Results:`, results);
    
    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Error in import-bulk-orders:`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred',
        imported: 0,
        duplicates: 0,
        errors: 1,
        errorDetails: [error.message]
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
