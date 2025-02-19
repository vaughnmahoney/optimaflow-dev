
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
    console.log('Searching for order:', searchQuery)
    
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

    const completionData = await completionResponse.json()
    console.log('Completion data:', completionData)

    // 3. Format the response
    const formattedResponse = {
      success: true,
      orders: [
        {
          data: searchData.orders[0].data,
          id: searchData.orders[0].id,
          scheduleInformation: searchData.orders[0].scheduleInformation
        }
      ],
      completion_data: completionData
    }

    console.log('Sending formatted response:', formattedResponse)

    return new Response(
      JSON.stringify(formattedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
