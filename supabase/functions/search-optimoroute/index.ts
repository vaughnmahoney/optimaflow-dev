
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { baseUrl, endpoints } from "../_shared/optimoroute.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPTIMOROUTE_API_KEY");
    if (!apiKey) {
      console.error("OptimoRoute API key not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "OptimoRoute API key not configured",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Parse request body
    const requestData = await req.json();
    const { searchQuery, orderNumbers } = requestData;

    // Debug: Log incoming request data
    console.log("Incoming request data:", JSON.stringify({
      hasSearchQuery: !!searchQuery,
      orderNumbersCount: orderNumbers?.length || 0,
      orderNumbersSample: orderNumbers?.slice(0, 3) || [],
    }));

    // Logic for searching by query string
    if (searchQuery) {
      console.log(`Searching for order: ${searchQuery}`);

      // Build the search request payload
      const searchPayload = {
        query: searchQuery,
        includeOrderData: true,
        includeScheduleInformation: true,
      };

      // Make the search API request
      const searchResponse = await fetch(
        `${baseUrl}${endpoints.search}?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchPayload),
        }
      );

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error("OptimoRoute search API error:", searchResponse.status, errorText);
        
        return new Response(
          JSON.stringify({
            success: false,
            error: `OptimoRoute Search API Error: ${searchResponse.status} ${errorText}`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: searchResponse.status,
          }
        );
      }

      // Process search results to get work order ID
      const searchData = await searchResponse.json();
      
      if (!searchData.orders || searchData.orders.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "No matching work orders found",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Return the first matching order
      const firstOrder = searchData.orders[0];
      
      return new Response(
        JSON.stringify({
          success: true,
          workOrderId: firstOrder.id,
          orderNo: firstOrder.data?.orderNo,
          searchResponse: searchData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } 
    // Logic for searching by array of order numbers
    else if (orderNumbers && Array.isArray(orderNumbers)) {
      console.log(`Searching for ${orderNumbers.length} order numbers`);
      console.log("Order numbers sample:", orderNumbers.slice(0, 5));
      
      // Format the order numbers as required by the API
      // The API expects an array of objects with orderNo property
      const formattedOrders = orderNumbers.map(orderNo => ({ orderNo }));
      
      // Build the search request payload with properly formatted orders
      const searchPayload = {
        orders: formattedOrders,
        includeOrderData: true,
        includeScheduleInformation: true,
      };
      
      // Enhanced debugging - log the complete payload
      console.log("Search payload:", JSON.stringify(searchPayload));
      
      // Make the search API request
      const searchResponse = await fetch(
        `${baseUrl}${endpoints.search}?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchPayload),
        }
      );
      
      // Debug the raw response
      console.log("Search response status:", searchResponse.status);
      console.log("Search response statusText:", searchResponse.statusText);
      
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error("OptimoRoute search API error:", searchResponse.status, errorText);
        
        // Try to parse the error response if it's JSON
        let parsedError = errorText;
        try {
          parsedError = JSON.parse(errorText);
          console.error("Parsed error:", JSON.stringify(parsedError));
        } catch (e) {
          console.error("Error response is not valid JSON");
        }
        
        return new Response(
          JSON.stringify({
            success: false,
            error: `OptimoRoute Search API Error: ${searchResponse.status} ${errorText}`,
            parsedError: parsedError !== errorText ? parsedError : undefined,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: searchResponse.status,
          }
        );
      }
      
      // Process search results
      const searchData = await searchResponse.json();
      
      // Enhanced debugging - Log the search results structure
      console.log("Search results summary:", JSON.stringify({
        hasOrders: !!searchData.orders,
        ordersCount: searchData.orders?.length || 0,
        ordersSample: searchData.orders?.slice(0, 2).map(o => ({
          id: o.id,
          orderNo: o.data?.orderNo,
          hasData: !!o.data,
          dataKeys: o.data ? Object.keys(o.data) : []
        })),
        responseKeys: Object.keys(searchData)
      }));
      
      if (!searchData.orders || searchData.orders.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "No matching orders found for the provided order numbers",
            requestedOrderNumbers: orderNumbers.slice(0, 10), // Send back the first 10 order numbers for debugging
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Return success response with orders
      return new Response(
        JSON.stringify({
          success: true,
          orders: searchData.orders,
          totalFound: searchData.orders.length,
          totalRequested: orderNumbers.length,
          // Add a summary of the found orders for debugging
          orderSummary: searchData.orders.slice(0, 5).map(order => ({
            id: order.id,
            orderNo: order.data?.orderNo,
            hasData: !!order.data,
            dataFields: order.data ? Object.keys(order.data) : []
          })),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    else {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Either searchQuery or orderNumbers must be provided",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error in search-optimoroute:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
