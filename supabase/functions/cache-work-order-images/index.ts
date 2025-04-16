
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const { workOrderId } = await req.json();
    
    if (!workOrderId) {
      return new Response(
        JSON.stringify({ success: false, error: "Work order ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Caching images for work order ID: ${workOrderId}`);
    
    // Get the work order data
    const { data: workOrder, error: workOrderError } = await supabase
      .from("work_orders")
      .select("*")
      .eq("id", workOrderId)
      .single();
    
    if (workOrderError) {
      console.error("Error fetching work order:", workOrderError);
      return new Response(
        JSON.stringify({ success: false, error: workOrderError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Check if images are already cached
    if (workOrder.images_cached) {
      console.log("Images already cached for this work order");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Images already cached", 
          cachedImages: workOrder.cached_images 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Extract images from completion_response
    const completionResponse = workOrder.completion_response;
    if (!completionResponse || 
        !completionResponse.orders || 
        !completionResponse.orders[0] || 
        !completionResponse.orders[0].data || 
        !completionResponse.orders[0].data.form || 
        !completionResponse.orders[0].data.form.images) {
      console.log("No images found in work order completion response");
      return new Response(
        JSON.stringify({ success: false, error: "No images found in work order" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    const images = completionResponse.orders[0].data.form.images;
    if (!Array.isArray(images) || images.length === 0) {
      console.log("No images array or empty images array in completion response");
      return new Response(
        JSON.stringify({ success: false, error: "No images found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    console.log(`Found ${images.length} images to cache`);
    
    // Process images
    const cachedImages = [];
    let successCount = 0;
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image.url) continue;
      
      try {
        console.log(`Processing image ${i + 1}/${images.length}: ${image.url}`);
        
        // Fetch the image
        const imageResponse = await fetch(image.url);
        if (!imageResponse.ok) {
          console.error(`Failed to fetch image ${i}: HTTP ${imageResponse.status}`);
          continue;
        }
        
        // Get the image data as a blob
        const imageBlob = await imageResponse.blob();
        
        // Generate a unique filename
        const fileName = `${workOrderId}/${i}_${Date.now()}.jpg`;
        const filePath = `${workOrder.order_no || 'unknown'}/${fileName}`;
        
        // Upload the image to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('work_order_images')
          .upload(filePath, imageBlob, {
            contentType: imageBlob.type || 'image/jpeg',
            upsert: true
          });
        
        if (uploadError) {
          console.error(`Error uploading image ${i}:`, uploadError);
          continue;
        }
        
        // Get the public URL
        const { data: publicUrlData } = await supabase
          .storage
          .from('work_order_images')
          .getPublicUrl(filePath);
        
        const cachedImageUrl = publicUrlData.publicUrl;
        
        // Add to cached images array
        cachedImages.push({
          originalUrl: image.url,
          cachedUrl: cachedImageUrl,
          type: image.type || 'unknown',
          fileName: fileName,
          filePath: filePath
        });
        
        successCount++;
        console.log(`Successfully cached image ${i + 1}/${images.length}`);
      } catch (error) {
        console.error(`Error processing image ${i}:`, error);
      }
    }
    
    // Update the work order with cached image information
    const { error: updateError } = await supabase
      .from("work_orders")
      .update({
        images_cached: true,
        cached_images: cachedImages
      })
      .eq("id", workOrderId);
    
    if (updateError) {
      console.error("Error updating work order with cached images:", updateError);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Images cached but failed to update work order",
          error: updateError.message,
          cachedImages 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully cached ${successCount} of ${images.length} images`,
        cachedImages 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
