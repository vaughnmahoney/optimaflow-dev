
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
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch data from OptimoRoute
    const optimoResponse = await fetch('https://api.optimoroute.com/v1/get_completion_details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPTIMOROUTE_API_KEY}`
      },
      body: JSON.stringify({
        date: today
      })
    });

    if (!optimoResponse.ok) {
      throw new Error(`OptimoRoute API error: ${optimoResponse.statusText}`);
    }

    const optimoData = await optimoResponse.json();
    console.log(`Fetched ${optimoData.orders?.length || 0} orders from OptimoRoute`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Process each order
    const processedOrders = await Promise.all((optimoData.orders || []).map(async (order: any) => {
      const workOrder = {
        optimoroute_id: order.id?.toString(),
        optimoroute_order_number: order.orderNumber,
        optimoroute_status: order.status,
        service_date: order.date,
        start_time: order.started ? new Date(order.started).toISOString() : null,
        end_time: order.completed ? new Date(order.completed).toISOString() : null,
        service_name: order.type,
        description: order.description,
        completion_notes: order.completionNotes,
        time_on_site: order.started && order.completed ? 
          `${Math.floor((new Date(order.completed).getTime() - new Date(order.started).getTime()) / 60000)} minutes` : 
          null
      };

      // Upsert work order
      const { error } = await supabase
        .from('work_orders')
        .upsert({
          ...workOrder
        }, {
          onConflict: 'optimoroute_id'
        });

      if (error) {
        console.error('Error upserting work order:', error);
        return { success: false, error: error.message, order: workOrder };
      }

      return { success: true, order: workOrder };
    }));

    console.log('Finished syncing OptimoRoute data');

    return new Response(JSON.stringify({
      message: 'Data sync completed',
      processed: processedOrders
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in fetch-optimoroute function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
