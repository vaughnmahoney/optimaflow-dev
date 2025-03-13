
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
      
      // Format the order numbers as required by the API
      // The API expects an array of objects with orderNo property
      const formattedOrders = orderNumbers.map(orderNo => ({ orderNo }));
      
      // Build the search request payload with properly formatted orders
      const searchPayload = {
        orders: formattedOrders,
        includeOrderData: true,
        includeScheduleInformation: true,
      };
      
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
      
      // Process search results
      const searchData = await searchResponse.json();
      
      if (!searchData.orders || searchData.orders.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "No matching orders found for the provided order numbers",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          orders: searchData.orders,
          totalFound: searchData.orders.length,
          totalRequested: orderNumbers.length,
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
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
