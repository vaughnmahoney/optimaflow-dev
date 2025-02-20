
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY')
    if (!optimoRouteApiKey) {
      console.error('OptimoRoute API key missing')
      throw new Error('OptimoRoute API key not configured')
    }

    const { searchQuery } = await req.json()
    console.log('Search query received:', searchQuery)

    if (!searchQuery) {
      throw new Error('Search query is required')
    }

    const baseUrl = 'https://api.optimoroute.com/v1'
    
    // 1. Search for orders
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
      const errorText = await searchResponse.text()
      console.error('OptimoRoute search error:', errorText)
      throw new Error(`OptimoRoute API error: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()
    console.log('Search data received:', searchData)
    
    if (!searchData.orders?.length) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No orders found' 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
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
      const errorText = await completionResponse.text()
      console.error('OptimoRoute completion error:', errorText)
      throw new Error(`OptimoRoute completion API error: ${completionResponse.status}`)
    }

    const completionData = await completionResponse.json()
    console.log('Completion data received:', completionData)

    // 3. Store in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing')
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

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

    return new Response(
      JSON.stringify({
        success: true,
        orders: searchData.orders,
        completion_data: completionData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
