
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
      
      // For multiple order numbers, we need to make a search request for each one
      // But there's a more efficient way by using a date range search and filtering
      // the results by orderNo
      
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      // Format dates as YYYY-MM-DD
      const startDate = oneYearAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      // Build the search request payload for a date range
      const searchPayload = {
        dateRange: {
          from: startDate,
          to: endDate,
        },
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
      
      // Process search results to find matching order numbers
      const searchData = await searchResponse.json();
      
      if (!searchData.orders || searchData.orders.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "No orders found in date range",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Filter orders to only include those with matching order numbers
      const matchingOrders = searchData.orders.filter(order => 
        orderNumbers.includes(order.data?.orderNo)
      );
      
      if (matchingOrders.length === 0) {
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
          orders: matchingOrders,
          totalFound: matchingOrders.length,
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
