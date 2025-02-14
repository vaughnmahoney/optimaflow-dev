
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
    const { searchQuery } = await req.json();

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search OptimoRoute API
    const optimoResponse = await fetch('https://api.optimoroute.com/v1/search_orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPTIMOROUTE_API_KEY}`
      },
      body: JSON.stringify({
        "orders": [
          {
            "orderNo": searchQuery
          }
        ],
        "includeOrderData": true
      })
    });

    if (!optimoResponse.ok) {
      throw new Error(`OptimoRoute API error: ${optimoResponse.statusText}`);
    }

    const optimoData = await optimoResponse.json();

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update work orders table with the latest data from OptimoRoute
    if (optimoData.orders && optimoData.orders.length > 0) {
      const updates = optimoData.orders.map(async (order: any) => {
        if (order.success && order.data) {
          const workOrder = {
            optimoroute_id: order.id?.toString(),
            optimoroute_order_number: order.data.orderNo,
            optimoroute_status: order.data.status,
            service_date: order.data.date,
            description: order.data.description,
            location: order.data.location,
            time_on_site: order.data.duration ? `${order.data.duration} minutes` : null
          };

          const { error } = await supabase
            .from('work_orders')
            .upsert(workOrder, {
              onConflict: 'optimoroute_id'
            });

          if (error) {
            console.error('Error upserting work order:', error);
          }
        }
      });

      await Promise.all(updates);
    }

    return new Response(
      JSON.stringify(optimoData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-optimoroute function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
