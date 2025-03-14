
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPTIMOROUTE_API_KEY = Deno.env.get('OPTIMOROUTE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting OptimoRoute routes fetch...');
    
    // Parse request body to get date
    const body = await req.json();
    const { date } = body;
    
    if (!date) {
      console.error('Missing date parameter');
      return new Response(
        JSON.stringify({ error: 'Missing date parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Fetching routes for date: ${date}`);
    
    // Step 1: Call OptimoRoute get_routes API - Changed from POST to GET
    const routesResponse = await fetch(`https://api.optimoroute.com/v1/get_routes?date=${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPTIMOROUTE_API_KEY}`
      }
    });

    // Check response
    if (!routesResponse.ok) {
      const errorText = await routesResponse.text();
      console.error(`OptimoRoute get_routes API error: ${routesResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `OptimoRoute API error: ${errorText}` }),
        { status: routesResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse response
    const routesData = await routesResponse.json();
    console.log(`Fetched ${routesData.routes?.length || 0} routes from OptimoRoute`);
    
    // Extract order numbers from all stops and include all stops regardless of orderNo value
    const orderNumbers = [];
    const routesByDriver = {};
    
    // Process routes to extract order numbers and organize by driver
    if (routesData.routes && routesData.routes.length > 0) {
      console.log(`Processing ${routesData.routes.length} routes`);
      routesData.routes.forEach(route => {
        const driverId = route.driverSerial || route.driverName;
        
        // Initialize driver info
        if (!routesByDriver[driverId]) {
          routesByDriver[driverId] = {
            id: driverId,
            name: route.driverName || `Driver ${driverId}`,
            stops: []
          };
        }
        
        // Process stops and collect order numbers
        if (route.stops && route.stops.length > 0) {
          console.log(`Processing ${route.stops.length} stops for driver ${driverId}`);
          route.stops.forEach(stop => {
            // Add stop to driver's stops regardless of orderNo value
            routesByDriver[driverId].stops.push(stop);
            
            // Collect real order numbers for search query (skip entries with "-" as orderNo)
            if (stop.orderNo && stop.orderNo !== "-") {
              orderNumbers.push(stop.orderNo);
            }
          });
        }
      });
    }
    
    console.log(`Extracted ${orderNumbers.length} order numbers for search`);
    console.log(`Created ${Object.keys(routesByDriver).length} driver entries`);
    
    // Prepare orders response - will include ALL stops, not just those with orderNo values
    const orders = [];
    
    // If we have order numbers, call search_orders API for additional data enrichment
    let orderDetailsMap = {};
    if (orderNumbers.length > 0) {
      console.log('Making search_orders API call with order numbers');
      
      // Step 2: Call OptimoRoute search_orders API with order numbers
      const searchResponse = await fetch('https://api.optimoroute.com/v1/search_orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPTIMOROUTE_API_KEY}`
        },
        body: JSON.stringify({ 
          orderNos: orderNumbers,
          includeOrderData: true
        })
      });

      // Check response
      if (searchResponse.ok) {
        // Parse search response
        const searchData = await searchResponse.json();
        console.log(`Fetched ${searchData.orders?.length || 0} orders from search_orders`);
        
        // Create a map of order numbers to order details
        if (searchData.orders && searchData.orders.length > 0) {
          searchData.orders.forEach(order => {
            if (order.data && order.data.orderNo) {
              orderDetailsMap[order.data.orderNo] = order;
            }
          });
        }
      } else {
        const errorText = await searchResponse.text();
        console.error(`OptimoRoute search_orders API error: ${searchResponse.status} - ${errorText}`);
        console.log('Will proceed with routes data only');
      }
    }
    
    // Process all stops from all drivers, regardless of orderNo
    console.log(`Building orders from all stops for ${Object.keys(routesByDriver).length} drivers`);
    Object.values(routesByDriver).forEach(driver => {
      driver.stops.forEach(stop => {
        // For stops with valid orderNo, enrich with search_orders data if available
        if (stop.orderNo && stop.orderNo !== "-" && orderDetailsMap[stop.orderNo]) {
          const orderDetails = orderDetailsMap[stop.orderNo];
          
          orders.push({
            id: stop.id || orderDetails.id,
            orderNumber: stop.orderNo,
            driverId: driver.id,
            driverName: driver.name,
            date: date,
            type: orderDetails.data?.type || '',
            location: {
              name: stop.locationName || orderDetails.data?.location?.locationName || 'Unknown',
              address: stop.address || orderDetails.data?.location?.address || 'Unknown Address',
              latitude: stop.latitude || orderDetails.data?.location?.latitude,
              longitude: stop.longitude || orderDetails.data?.location?.longitude
            },
            scheduledAt: stop.scheduledAtDt || stop.scheduledAt,
            notes: orderDetails.data?.notes || '',
            customFields: orderDetails.data?.customFields || {}
          });
        } 
        // For ALL stops, including those with orderNo as "-", create basic order records
        else {
          orders.push({
            id: stop.id,
            orderNumber: stop.orderNo !== "-" ? stop.orderNo : `stop-${stop.id}`, // Create a unique identifier for stops without real order numbers
            driverId: driver.id,
            driverName: driver.name,
            date: date,
            type: 'route-stop', // Add a default type for stops without real order numbers
            location: {
              name: stop.locationName || 'Unknown',
              address: stop.address || 'Unknown Address',
              latitude: stop.latitude,
              longitude: stop.longitude
            },
            scheduledAt: stop.scheduledAtDt || stop.scheduledAt,
            notes: '',
            customFields: {}
          });
        }
      });
    });
    
    console.log(`Prepared ${orders.length} combined orders for response`);

    // Format response
    const response = {
      success: true,
      orders: orders,
      driverCount: Object.keys(routesByDriver).length,
      orderCount: orders.length,
      message: 'Successfully fetched route and order data'
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-optimoroute-routes function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
