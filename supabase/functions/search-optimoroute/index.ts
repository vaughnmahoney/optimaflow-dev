
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPTIMOROUTE_API_KEY = Deno.env.get('OPTIMOROUTE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatOptimoRouteData = (combinedData: any) => {
  return combinedData.orders.map((order: any) => {
    const orderData = order.data;
    const completionData = order.completionDetails;

    return {
      id: orderData.id?.toString(),
      orderNo: orderData.orderNo,
      date: orderData.date,
      location: {
        name: orderData.location?.locationName || '',
        address: orderData.location?.address || '',
        coordinates: {
          lat: orderData.location?.latitude || 0,
          lng: orderData.location?.longitude || 0
        }
      },
      status: completionData?.status || 'pending',
      completionTime: completionData?.completionTime,
      notes: orderData.notes || '',
      customFields: {
        groundUnits: orderData.customField1,
        deliveryDate: orderData.customField5,
      },
      photos: completionData?.photos?.map((photo: any) => photo.url) || [],
      signatures: completionData?.signatures?.map((sig: any) => sig.url) || [],
      driverNotes: completionData?.driverNotes
    };
  });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchQuery } = await req.json();
    console.log('Received search query:', searchQuery);

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get order details
    console.log('Fetching order details...');
    const orderResponse = await fetch(
      `https://api.optimoroute.com/v1/search_orders?key=${OPTIMOROUTE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orders: [{ orderNo: searchQuery }],
          includeOrderData: true
        })
      }
    );

    const orderData = await orderResponse.json();
    console.log('Order details response:', orderData);

    if (!orderResponse.ok) {
      throw new Error(`OptimoRoute API error (order details): ${orderResponse.statusText}`);
    }

    // Get completion details
    console.log('Fetching completion details...');
    const completionResponse = await fetch(
      `https://api.optimoroute.com/v1/get_completion_details?key=${OPTIMOROUTE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orders: [{ orderNo: searchQuery }]
        })
      }
    );

    const completionData = await completionResponse.json();
    console.log('Completion details response:', completionData);

    if (!completionResponse.ok) {
      throw new Error(`OptimoRoute API error (completion details): ${completionResponse.statusText}`);
    }

    // Combine and format the data
    const combinedData = {
      ...orderData,
      orders: orderData.orders.map((order: any) => ({
        ...order,
        completionDetails: completionData.orders.find((c: any) => c.orderNo === order.data.orderNo)
      }))
    };

    const formattedOrders = formatOptimoRouteData(combinedData);
    console.log('Formatted orders:', formattedOrders);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let success = false;
    // Update work orders table with the formatted data
    if (formattedOrders && formattedOrders.length > 0) {
      const updates = formattedOrders.map(async (order: any) => {
        const workOrder = {
          optimoroute_id: order.id,
          optimoroute_order_number: order.orderNo,
          optimoroute_status: order.status,
          service_date: order.date,
          description: order.notes,
          location: order.location,
          service_name: 'Imported Service',
          completion_data: {
            status: order.status,
            completionTime: order.completionTime,
            photos: order.photos,
            signatures: order.signatures,
            driverNotes: order.driverNotes,
            customFields: order.customFields
          },
          technician_id: '00000000-0000-0000-0000-000000000000',
          customer_id: '00000000-0000-0000-0000-000000000000'
        };

        const { error } = await supabase
          .from('work_orders')
          .upsert(workOrder, {
            onConflict: 'optimoroute_id'
          });

        if (error) {
          console.error('Error upserting work order:', error);
          throw error;
        }
        success = true;
      });

      await Promise.all(updates);
    }

    return new Response(
      JSON.stringify({ 
        success, 
        data: formattedOrders[0] || null 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-optimoroute function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
