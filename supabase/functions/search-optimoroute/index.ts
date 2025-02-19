
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY')
const baseUrl = 'https://api.optimoroute.com/v1'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchQuery } = await req.json()
    console.log('Searching for order:', searchQuery)
    
    if (!optimoRouteApiKey) {
      throw new Error('OptimoRoute API key not configured')
    }
    
    // 1. Search for orders with full data
    const searchResponse = await fetch(
      `${baseUrl}/search_orders?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          includeOrderData: true,
          includeScheduleInformation: true
        })
      }
    )

    if (!searchResponse.ok) {
      const errorData = await searchResponse.text()
      console.error('OptimoRoute API error:', errorData)
      throw new Error(`OptimoRoute API error: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()
    console.log('Search response:', searchData)
    
    if (!searchData.orders || searchData.orders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Get completion details
    const completionResponse = await fetch(
      `${baseUrl}/get_completion_details?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: searchData.orders[0].id
        })
      }
    )

    if (!completionResponse.ok) {
      const errorData = await completionResponse.text()
      console.error('OptimoRoute completion API error:', errorData)
      throw new Error(`OptimoRoute completion API error: ${completionResponse.status}`)
    }

    const completionData = await completionResponse.json()
    console.log('Completion data:', completionData)

    // 3. Store in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: dbError } = await supabase
      .from('work_orders')
      .insert({
        order_no: searchQuery,
        search_response: searchData.orders[0],
        completion_response: completionData,
        status: 'pending_review'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to store work order')
    }

    // 4. Return formatted response
    return new Response(
      JSON.stringify({
        success: true,
        orders: searchData.orders,
        completion_data: completionData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
