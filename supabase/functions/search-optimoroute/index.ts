
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchQuery } = await req.json()
    console.log('Received search query:', searchQuery)

    // Validate inputs
    if (!searchQuery) {
      throw new Error('Search query is required')
    }

    const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY')
    if (!optimoRouteApiKey) {
      throw new Error('OptimoRoute API key not configured')
    }

    // 1. Search OptimoRoute for order
    console.log('Fetching order details from OptimoRoute...')
    const searchResponse = await fetch('https://api.optimoroute.com/v1/search_orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: optimoRouteApiKey,
        query: searchQuery,
        includeOrderData: true,
        includeScheduleInformation: true
      })
    })

    if (!searchResponse.ok) {
      throw new Error(`OptimoRoute search failed: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()
    console.log('Search response received:', searchData)

    if (!searchData.orders?.length) {
      return new Response(
        JSON.stringify({ success: false, error: 'No orders found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const order = searchData.orders[0]

    // 2. Get completion details
    console.log('Fetching completion details...')
    const completionResponse = await fetch('https://api.optimoroute.com/v1/get_completion_details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: optimoRouteApiKey,
        orderId: order.id
      })
    })

    if (!completionResponse.ok) {
      throw new Error(`OptimoRoute completion details failed: ${completionResponse.status}`)
    }

    const completionData = await completionResponse.json()
    console.log('Completion data received:', completionData)

    // 3. Store in Supabase
    console.log('Storing data in Supabase...')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: existingOrder, error: checkError } = await supabase
      .from('work_orders')
      .select('id')
      .eq('order_no', searchQuery)
      .maybeSingle()

    if (checkError) {
      throw new Error(`Database check failed: ${checkError.message}`)
    }

    let workOrderId

    if (existingOrder) {
      // Update existing order
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({
          search_response: order,
          completion_response: completionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingOrder.id)

      if (updateError) throw new Error(`Failed to update work order: ${updateError.message}`)
      workOrderId = existingOrder.id
    } else {
      // Insert new order
      const { data: newOrder, error: insertError } = await supabase
        .from('work_orders')
        .insert({
          order_no: searchQuery,
          search_response: order,
          completion_response: completionData,
          status: 'pending_review',
          timestamp: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw new Error(`Failed to insert work order: ${insertError.message}`)
      workOrderId = newOrder.id
    }

    console.log('Successfully stored work order:', workOrderId)

    return new Response(
      JSON.stringify({
        success: true,
        workOrderId,
        order: {
          ...order,
          completion_data: completionData
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
