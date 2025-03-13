
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Define the response type for our API
interface ApiResponse {
  success: boolean;
  routes?: any[];
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
    const { date } = await req.json();

    if (!date) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Date parameter is required",
        }),
        { headers, status: 400 }
      );
    }

    console.log(`Fetching routes for date: ${date}`);

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

    // Fetch data from OptimoRoute API
    const response = await fetch(
      `https://api.optimoroute.com/v1/get_routes?date=${date}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OptimoRoute API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `OptimoRoute API returned ${response.status}: ${errorText}`,
        }),
        { headers, status: response.status }
      );
    }

    const data = await response.json();

    // Transform the data if needed
    const result: ApiResponse = {
      success: true,
      routes: data.routes || [],
    };

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
