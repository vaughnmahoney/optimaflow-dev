
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY')
if (!optimoRouteApiKey) {
  throw new Error('OPTIMOROUTE_API_KEY is required')
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchQuery } = await req.json()
    console.log('Searching for order:', searchQuery)

    // Make request to OptimoRoute API
    const response = await fetch(
      `https://api.optimoroute.com/v1/orders/${searchQuery}`,
      {
        headers: {
          'Authorization': `Bearer ${optimoRouteApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    console.log('OptimoRoute API response:', data)

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch order from OptimoRoute')
    }

    // Transform the data into our format
    const transformedData = {
      id: data.order_id || data.id,
      order_no: searchQuery,
      external_id: data.id,
      status: data.status,
      service_date: data.date,
      location: {
        name: data.location_name,
        address: data.address,
        coordinates: {
          latitude: data.latitude,
          longitude: data.longitude
        }
      },
      service_notes: data.notes,
      description: data.description,
      custom_fields: {
        groundUnits: data.custom_field_values?.ground_units,
        deliveryDate: data.custom_field_values?.delivery_date,
        field3: data.custom_field_values?.field3,
        field4: data.custom_field_values?.field4,
        field5: data.custom_field_values?.field5
      },
      completion_data: {
        data: {
          status: data.completion_status,
          form: {
            images: data.photos?.map((photo: any) => ({
              type: photo.type,
              url: photo.url
            })) || [],
            signature: data.signature,
            note: data.completion_notes
          }
        }
      }
    }

    console.log('Transformed data:', transformedData)

    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
