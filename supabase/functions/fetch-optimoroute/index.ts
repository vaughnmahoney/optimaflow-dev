
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
    console.log('Starting OptimoRoute data fetch...');
    
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
    
    console.log(`Fetching data for date: ${date}`);
    
    // Call OptimoRoute API
    const optimoRouteResponse = await fetch('https://api.optimoroute.com/v1/get_routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPTIMOROUTE_API_KEY}`
      },
      body: JSON.stringify({ date })
    });

    // Check response
    if (!optimoRouteResponse.ok) {
      const errorText = await optimoRouteResponse.text();
      console.error(`OptimoRoute API error: ${optimoRouteResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `OptimoRoute API error: ${errorText}` }),
        { status: optimoRouteResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse response
    const optimoData = await optimoRouteResponse.json();
    console.log(`Fetched ${optimoData.orders?.length || 0} orders from OptimoRoute`);

    // Format response
    const response = {
      success: true,
      orders: optimoData.orders || [],
      message: 'Successfully fetched route data'
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-optimoroute function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
