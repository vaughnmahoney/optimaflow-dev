
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { workOrderId } = await req.json()

    if (!workOrderId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Work Order ID is required" 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Fetch work order with completion response
    const { data: workOrder, error: fetchError } = await supabase
      .from('work_orders')
      .select('completion_response')
      .eq('id', workOrderId)
      .single()

    if (fetchError || !workOrder) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Work order not found" 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    const images = workOrder.completion_response?.orders?.[0]?.data?.form?.images || []

    if (!images.length) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No images found in work order" 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Download and upload each image to Supabase storage
    const cachedImages = await Promise.all(
      images.map(async (image: any, index: number) => {
        const imageResponse = await fetch(image.url)
        const imageBlob = await imageResponse.blob()
        
        const fileName = `work_order_${workOrderId}_image_${index}.webp`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('work-order-images')
          .upload(fileName, imageBlob, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error(`Error uploading image ${index}:`, uploadError)
          return null
        }

        const cachedUrl = supabase.storage
          .from('work-order-images')
          .getPublicUrl(fileName).data.publicUrl

        return {
          originalUrl: image.url,
          cachedUrl,
          type: image.type,
          fileName: fileName,
          filePath: uploadData?.path,
          flagged: image.flagged || false
        }
      })
    )

    // Filter out any failed uploads
    const validCachedImages = cachedImages.filter(img => img !== null)

    // Update work order with cached images
    const { error: updateError } = await supabase
      .from('work_orders')
      .update({
        images_cached: true,
        cached_images: validCachedImages
      })
      .eq('id', workOrderId)

    if (updateError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to update work order" 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        cachedImages: validCachedImages 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error("Error in cache-work-order-images function:", error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

