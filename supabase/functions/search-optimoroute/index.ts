
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY')
const baseUrl = 'https://api.optimoroute.com/v1'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchQuery } = await req.json()
    console.log('Received search query:', searchQuery)
    
    // 1. First get the order details
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

    const searchData = await searchResponse.json()
    console.log('Search response:', searchData)
    
    // Check if we found any orders
    if (!searchData.orders || searchData.orders.length === 0) {
      console.log('No orders found')
      return new Response(
        JSON.stringify({ error: 'Order not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Then get the completion details
    const completionResponse = await fetch(
      `${baseUrl}/get_completion_details?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: searchQuery
        })
      }
    )

    const completionData = await completionResponse.json()
    console.log('Completion data:', completionData)

    // 3. Combine the data
    const response = {
      success: true,
      orders: searchData.orders,
      completion_data: completionData
    }
    
    console.log('Final response:', response)
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in edge function:', error)
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
