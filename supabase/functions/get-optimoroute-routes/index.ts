
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
    
    // Step 1: Call OptimoRoute get_routes API
    const routesResponse = await fetch('https://api.optimoroute.com/v1/get_routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPTIMOROUTE_API_KEY}`
      },
      body: JSON.stringify({ date })
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
    
    // Extract order numbers from all stops
    const orderNumbers = [];
    const routesByDriver = {};
    
    // Process routes to extract order numbers and organize by driver
    if (routesData.routes && routesData.routes.length > 0) {
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
          route.stops.forEach(stop => {
            // Add stop to driver's stops
            routesByDriver[driverId].stops.push(stop);
            
            // Collect order numbers for search query (skip entries with "-" as orderNo)
            if (stop.orderNo && stop.orderNo !== "-") {
              orderNumbers.push(stop.orderNo);
            }
          });
        }
      });
    }
    
    console.log(`Extracted ${orderNumbers.length} order numbers for search`);
    
    // Prepare orders response
    const orders = [];
    
    // If we have order numbers, call search_orders API
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
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error(`OptimoRoute search_orders API error: ${searchResponse.status} - ${errorText}`);
        console.log('Will proceed with routes data only');
      } else {
        // Parse search response
        const searchData = await searchResponse.json();
        console.log(`Fetched ${searchData.orders?.length || 0} orders from search_orders`);
        
        // Process orders and match with routes
        if (searchData.orders && searchData.orders.length > 0) {
          // Create a map of order numbers to order details
          const orderDetailsMap = {};
          searchData.orders.forEach(order => {
            if (order.data && order.data.orderNo) {
              orderDetailsMap[order.data.orderNo] = order;
            }
          });
          
          // Prepare the final orders with combined data
          Object.values(routesByDriver).forEach(driver => {
            driver.stops.forEach(stop => {
              if (stop.orderNo && stop.orderNo !== "-" && orderDetailsMap[stop.orderNo]) {
                const orderDetails = orderDetailsMap[stop.orderNo];
                
                // Create a complete order object with data from both APIs
                const order = {
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
                  customFields: {
                    // Include any relevant custom fields from orderDetails
                    customField1: orderDetails.data?.customField1,
                    customField2: orderDetails.data?.customField2,
                    customField3: orderDetails.data?.customField3,
                    customField4: orderDetails.data?.customField4,
                    customField5: orderDetails.data?.customField5,
                  }
                };
                
                orders.push(order);
              } else if (stop.orderNo && stop.orderNo !== "-") {
                // Create an order with just the route stop data
                orders.push({
                  id: stop.id,
                  orderNumber: stop.orderNo,
                  driverId: driver.id,
                  driverName: driver.name,
                  date: date,
                  location: {
                    name: stop.locationName || 'Unknown',
                    address: stop.address || 'Unknown Address',
                    latitude: stop.latitude,
                    longitude: stop.longitude
                  },
                  scheduledAt: stop.scheduledAtDt || stop.scheduledAt
                });
              }
            });
          });
        }
      }
    }
    
    // If we didn't get any orders from search_orders, use just the route data
    if (orders.length === 0) {
      console.log('Using route data only to build orders response');
      
      Object.values(routesByDriver).forEach(driver => {
        driver.stops.forEach(stop => {
          if (stop.orderNo && stop.orderNo !== "-") {
            orders.push({
              id: stop.id,
              orderNumber: stop.orderNo,
              driverId: driver.id,
              driverName: driver.name,
              date: date,
              location: {
                name: stop.locationName || 'Unknown',
                address: stop.address || 'Unknown Address',
                latitude: stop.latitude,
                longitude: stop.longitude
              },
              scheduledAt: stop.scheduledAtDt || stop.scheduledAt
            });
          }
        });
      });
    }
    
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
