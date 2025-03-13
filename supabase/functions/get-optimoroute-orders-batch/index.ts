
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Define the response type for our API
interface ApiResponse {
  success: boolean;
  orders?: any[];
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Set CORS headers for the actual request
  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const { orderNos } = await req.json();

    if (!orderNos || !Array.isArray(orderNos) || orderNos.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order numbers array is required",
        }),
        { headers, status: 400 }
      );
    }

    console.log(`Fetching details for ${orderNos.length} orders`);

    // Get the OptimoRoute API key from the environment
    const apiKey = Deno.env.get("OPTIMOROUTE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "OptimoRoute API key not configured",
        }),
        { headers, status: 500 }
      );
    }

    // Fetch order details in batches
    const batchSize = 10; // Adjust based on OptimoRoute API limits
    const orderDetails = [];
    const errors = [];

    for (let i = 0; i < orderNos.length; i += batchSize) {
      const batch = orderNos.slice(i, i + batchSize);
      const batchPromises = batch.map(async (orderNo) => {
        try {
          const response = await fetch(
            `https://api.optimoroute.com/v1/get_order?order_no=${orderNo}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error fetching order ${orderNo}: ${response.status} - ${errorText}`);
            errors.push(`Error fetching order ${orderNo}: ${response.status}`);
            return null;
          }

          const data = await response.json();
          return data;
        } catch (error) {
          console.error(`Exception fetching order ${orderNo}:`, error);
          errors.push(`Exception fetching order ${orderNo}: ${error.message}`);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      orderDetails.push(...batchResults.filter(Boolean));

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < orderNos.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Transform the data if needed
    const result: ApiResponse = {
      success: true,
      orders: orderDetails,
    };

    if (errors.length > 0) {
      console.warn(`Completed with ${errors.length} errors:`, errors);
    }

    // Return the response
    return new Response(JSON.stringify(result), { headers });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      { headers, status: 500 }
    );
  }
});
