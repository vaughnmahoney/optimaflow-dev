
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { baseUrl, endpoints } from "../_shared/optimoroute.ts";

interface GetRoutesRequest {
  date: string;
  driverSerial?: string;
}

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
    const requestData: GetRoutesRequest = await req.json();
    const { date, driverSerial } = requestData;

    if (!date) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Date parameter is required",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Fetching routes for date: ${date}`);

    // Build query parameters
    let url = `${baseUrl}${endpoints.routes}?key=${apiKey}&date=${date}`;
    
    if (driverSerial) {
      url += `&driverSerial=${driverSerial}`;
    }

    // Make the API request to OptimoRoute
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OptimoRoute API error:", response.status, errorText);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `OptimoRoute API Error: ${response.status} ${errorText}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        }
      );
    }

    // Parse and return the response
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in get-optimoroute-routes:", error);
    
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
