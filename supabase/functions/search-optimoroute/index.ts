
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
      
      // For orderNumbers array, use the direct orders parameter instead of date range filtering
      const searchPayload = {
        orders: orderNumbers.map(orderNo => ({ orderNo })),
        includeOrderData: true,
        includeScheduleInformation: true
      };
      
      console.log("Search payload:", JSON.stringify(searchPayload));
      
      // Make the direct search API request
      const searchResponse = await fetch(
        `${baseUrl}${endpoints.get_orders}?key=${apiKey}`,
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
        console.error("OptimoRoute get_orders API error:", searchResponse.status, errorText);
        
        return new Response(
          JSON.stringify({
            success: false,
            error: `OptimoRoute Get Orders API Error: ${searchResponse.status} ${errorText}`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: searchResponse.status,
          }
        );
      }
      
      // Process response
      const ordersData = await searchResponse.json();
      
      if (!ordersData.success || !ordersData.orders || ordersData.orders.length === 0) {
        // Fallback to date range search if direct order lookup fails
        console.log("Direct order lookup failed, trying date range search as fallback");
        
        // Use a wider date range for fallback - 35 days (maximum allowed by API)
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 30); // 30 days before today
        
        // Format dates as YYYY-MM-DD
        const fromDate = pastDate.toISOString().split('T')[0];
        const toDate = today.toISOString().split('T')[0];
        
        // Build the fallback search request payload
        const fallbackPayload = {
          dateRange: {
            from: fromDate,
            to: toDate,
          },
          includeOrderData: true,
          includeScheduleInformation: true,
        };
        
        console.log("Fallback search with date range:", JSON.stringify(fallbackPayload));
        
        // Make the fallback search API request
        const fallbackResponse = await fetch(
          `${baseUrl}${endpoints.search}?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(fallbackPayload),
          }
        );
        
        if (!fallbackResponse.ok) {
          const errorText = await fallbackResponse.text();
          console.error("OptimoRoute fallback search API error:", fallbackResponse.status, errorText);
          
          return new Response(
            JSON.stringify({
              success: false,
              error: `OptimoRoute Fallback Search API Error: ${fallbackResponse.status} ${errorText}`,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: fallbackResponse.status,
            }
          );
        }
        
        const fallbackData = await fallbackResponse.json();
        
        if (!fallbackData.orders || fallbackData.orders.length === 0) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "No orders found in fallback date range search",
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Filter the fallback results to match our order numbers
        const matchingOrders = fallbackData.orders.filter(order => 
          orderNumbers.includes(order.data?.orderNo)
        );
        
        if (matchingOrders.length === 0) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "No matching orders found for the provided order numbers in fallback search",
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
            searchMethod: "fallback_date_range",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          orders: ordersData.orders,
          totalFound: ordersData.orders.length,
          totalRequested: orderNumbers.length,
          searchMethod: "direct_lookup",
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
