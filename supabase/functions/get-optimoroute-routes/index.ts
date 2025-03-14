
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { baseUrl, endpoints } from "../_shared/optimoroute.ts";

serve(async (req) => {
  // Handle CORS preflight requests
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
    
    const apiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
    if (!apiKey) {
      console.error('OptimoRoute API key not configured');
      return new Response(
        JSON.stringify({ error: 'OptimoRoute API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Fetching routes for date: ${date}`);
    
    // Build the URL with the API key as a query parameter (as per working example)
    const url = `${baseUrl}${endpoints.routes}?key=${apiKey}&date=${date}`;
    
    // Make the API request to OptimoRoute
    const routesResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Check response
    if (!routesResponse.ok) {
      const errorText = await routesResponse.text();
      console.error(`OptimoRoute get_routes API error: ${routesResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `OptimoRoute API error: ${errorText}` 
        }),
        { status: routesResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the raw response
    const routesData = await routesResponse.json();
    
    // Process routes to extract driver and order information
    console.log('Processing OptimoRoute response...');
    const processedResponse = processOptimoRouteResponse(routesData, date);
    
    return new Response(
      JSON.stringify(processedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-optimoroute-routes function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Process the OptimoRoute API response to extract drivers and orders
 */
function processOptimoRouteResponse(data: any, date: string) {
  const drivers: any[] = [];
  const orders: any[] = [];
  const orderIds: string[] = [];
  const routesByDriver: Record<string, any> = {};
  
  // Check if we have routes data
  if (data.routes && data.routes.length > 0) {
    console.log(`Processing ${data.routes.length} routes`);
    
    // First pass: Organize routes by driver
    data.routes.forEach((route: any) => {
      const driverId = route.driverSerial || route.driverName || `driver-${Math.random().toString(36).substring(2, 10)}`;
      
      // Initialize driver info
      if (!routesByDriver[driverId]) {
        routesByDriver[driverId] = {
          id: driverId,
          name: route.driverName || `Driver ${driverId}`,
          stops: []
        };
      }
      
      // Process stops
      if (route.stops && route.stops.length > 0) {
        routesByDriver[driverId].stops.push(...route.stops);
      }
    });
    
    // Second pass: Create orders from stops
    for (const driverId in routesByDriver) {
      const driver = routesByDriver[driverId];
      const driverWorkOrders: any[] = [];
      
      driver.stops.forEach((stop: any) => {
        // Create a work order for each stop
        const workOrderId = stop.id || `stop-${Math.random().toString(36).substring(2, 10)}`;
        const orderNo = stop.orderNo && stop.orderNo !== "-" ? stop.orderNo : `stop-${workOrderId}`;
        
        // Collect all order numbers for batch processing
        if (orderNo && orderNo !== "-") {
          orderIds.push(orderNo);
        }
        
        // Extract location information
        const location = {
          name: stop.locationName || 'Unknown Location',
          address: stop.address || 'No Address',
          latitude: stop.latitude,
          longitude: stop.longitude
        };
        
        // Create a basic set of materials based on the location name
        // This is a simplification - in a real app, you'd use actual material data
        const materials = [];
        
        // Add a default filter if the location name suggests it's a filter job
        if (location.name.toLowerCase().includes('filter')) {
          materials.push({
            id: `filter-${workOrderId}`,
            name: 'Standard Air Filter',
            type: 'filter',
            quantity: 1,
            unit: 'piece'
          });
        }
        
        // Add a default coil if the location name suggests it's a coil cleaning job
        if (location.name.toLowerCase().includes('coil')) {
          materials.push({
            id: `coil-${workOrderId}`,
            name: 'Standard HVAC Coil',
            type: 'coil',
            quantity: 1,
            unit: 'piece'
          });
        }
        
        // If no specific materials were identified, add a generic service visit material
        if (materials.length === 0) {
          materials.push({
            id: `service-${workOrderId}`,
            name: 'Service Visit',
            type: 'supplies',
            quantity: 1,
            unit: 'visit'
          });
        }
        
        // Create the work order
        const workOrder = {
          id: workOrderId,
          orderId: orderNo,
          locationName: location.name,
          address: location.address,
          date: stop.date || date,
          materials,
          notes: stop.notes || '' // Initial notes from stop data
        };
        
        // Add to driver's work orders
        driverWorkOrders.push(workOrder);
        
        // Add to all orders
        orders.push({
          id: workOrderId,
          orderNumber: orderNo,
          driverId: driverId,
          driverName: driver.name,
          date: stop.date || date,
          type: stop.type || 'route-stop',
          location,
          scheduledAt: stop.scheduledAtDt || stop.scheduledAt,
          notes: stop.notes || '',
          customFields: {}
        });
      });
      
      // Add the driver with their work orders
      drivers.push({
        id: driverId,
        name: driver.name,
        workOrders: driverWorkOrders
      });
    }
  } else {
    console.log('No routes found in the API response');
  }
  
  // Create and return the final response
  return {
    success: true,
    drivers: drivers,
    orders: orders,
    orderIds: orderIds, // Include all order IDs for batch processing
    driverCount: drivers.length,
    orderCount: orders.length,
    notesIncluded: false, // Flag indicating detailed notes aren't included yet
    message: 'Successfully fetched and processed route data'
  };
}
