
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const requestData = await req.json().catch(() => ({}));
    const { startDate, endDate } = requestData;
    
    if (!startDate || !endDate) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing date parameters: startDate and endDate are required"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    // Get API key and validate it exists
    const apiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
    console.log("API Key check:", apiKey ? `Found (length: ${apiKey.length})` : "Not found");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "OptimoRoute API key not configured"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    console.log(`Fetching orders for date range: ${startDate} to ${endDate}`);
    
    // Initialize variables for pagination
    let allOrders = [];
    let afterTag = null;
    let hasMorePages = true;
    let pageCount = 0;
    let totalProcessed = 0;
    
    // Process orders in batches using afterTag pagination
    while (hasMorePages) {
      pageCount++;
      console.log(`Fetching orders page ${pageCount}${afterTag ? ' with after_tag: ' + afterTag : ''}`);
      
      // Build the URL with the API key as a query parameter
      const searchUrl = `https://api.optimoroute.com/v1/search_orders?key=${apiKey}`;
      
      // Prepare request body
      const requestBody = {
        dateRange: {
          from: startDate,
          to: endDate
        },
        includeOrderData: true,
        includeScheduleInformation: true
      };
      
      // Add after_tag if we're not on the first page - using the correct parameter name
      if (afterTag) {
        requestBody.after_tag = afterTag;
      }
      
      // Log request details (but sanitize the API key for security)
      const logSafeUrl = `https://api.optimoroute.com/v1/search_orders?key=${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
      console.log("Request to OptimoRoute URL:", logSafeUrl);
      console.log("Request body:", JSON.stringify(requestBody));

      try {
        // Call search_orders API with key in URL
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        // Log response status
        console.log(`OptimoRoute API response status: ${response.status}`);
        
        // If not OK, get and log the error details
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OptimoRoute API error (${response.status}): ${errorText}`);
          return new Response(
            JSON.stringify({
              success: false,
              error: `OptimoRoute API error: ${response.status} - ${errorText}`
            }),
            {
              status: response.status,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders
              }
            }
          );
        }
        
        const data = await response.json();
        
        // Validate response
        if (!data || typeof data !== 'object') {
          console.error("Invalid response format from OptimoRoute API:", data);
          throw new Error('Invalid response from OptimoRoute API');
        }
        
        // Check for success field in response
        if (data.success !== true) {
          const errorMsg = data.message || 'Unknown error';
          console.error(`OptimoRoute API error: ${errorMsg}`);
          throw new Error(`OptimoRoute API error: ${errorMsg}`);
        }
        
        // Check for orders field in response
        if (!Array.isArray(data.orders)) {
          console.error("Missing orders array in response:", data);
          throw new Error('OptimoRoute API response missing orders array');
        }
        
        const batchSize = data.orders.length;
        totalProcessed += batchSize;
        console.log(`Received ${batchSize} orders in page ${pageCount}, total processed: ${totalProcessed}`);
        
        // Add orders to our collection
        allOrders = allOrders.concat(data.orders);
        
        // Check if there are more pages to fetch - using the correct property name after_tag
        if (data.after_tag) {
          afterTag = data.after_tag;
          console.log(`More pages available, next after_tag: ${afterTag}`);
          // Increase delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000)); // Increased from 500ms to 1000ms
        } else {
          hasMorePages = false;
          console.log(`No more pages, finished after ${pageCount} page(s)`);
        }
        
        // If we've fetched 5000 orders, stop to avoid processing too much at once
        if (totalProcessed >= 5000) {
          console.log(`Reached order limit of 5000, stopping pagination`);
          hasMorePages = false;
        }
      } catch (error) {
        console.error(`Error in page ${pageCount}:`, error);
        // Add a retry mechanism for failed requests
        const maxRetries = 3;
        let retryCount = 0;
        let retrySuccess = false;
        
        while (retryCount < maxRetries && !retrySuccess) {
          retryCount++;
          console.log(`Retry attempt ${retryCount}/${maxRetries} for page ${pageCount}...`);
          
          // Exponential backoff: wait longer between each retry
          const backoffDelay = Math.pow(2, retryCount) * 1000;
          console.log(`Waiting ${backoffDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          
          try {
            const retryResponse = await fetch(searchUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody)
            });
            
            if (!retryResponse.ok) {
              console.error(`Retry failed with status ${retryResponse.status}`);
              continue;
            }
            
            const retryData = await retryResponse.json();
            
            if (retryData.success !== true || !Array.isArray(retryData.orders)) {
              console.error("Retry returned invalid data:", retryData);
              continue;
            }
            
            // Retry was successful
            const retryBatchSize = retryData.orders.length;
            totalProcessed += retryBatchSize;
            console.log(`Retry successful! Received ${retryBatchSize} orders in retry for page ${pageCount}`);
            
            allOrders = allOrders.concat(retryData.orders);
            
            // Use the correct property name after_tag for checking pagination
            if (retryData.after_tag) {
              afterTag = retryData.after_tag;
            } else {
              hasMorePages = false;
            }
            
            retrySuccess = true;
          } catch (retryError) {
            console.error(`Retry ${retryCount} failed:`, retryError);
          }
        }
        
        if (!retrySuccess) {
          // If all retries failed, continue to the next page or stop
          console.log(`All retries failed for page ${pageCount}, ${hasMorePages ? 'continuing to next page' : 'stopping pagination'}`);
          // If we had an afterTag, we can try to continue from the next page
          if (!afterTag) {
            hasMorePages = false;
          }
        }
      }
    }
    
    console.log(`Total orders fetched: ${allOrders.length}`);
    
    // Extract LDS data and order information
    const ldsData = [];
    const orderToLdsMap = new Map();
    
    for (const order of allOrders) {
      if (order.data && order.data.orderNo) {
        const orderNo = order.data.orderNo;
        const ldsDate = order.data.customField5 || null;
        
        // Only process if we have a valid order number
        if (orderNo) {
          orderToLdsMap.set(orderNo, ldsDate);
          
          ldsData.push({
            order_no: orderNo,
            lds: ldsDate
          });
        }
      }
    }
    
    console.log(`Orders with extracted LDS data: ${ldsData.length}`);
    
    // Sample some LDS data for logging
    const sampleLDS = ldsData.slice(0, 5);
    console.log("Sample LDS data:", sampleLDS);
    
    // Now update the reports table with LDS data
    let updatedCount = 0;
    let errorCount = 0;
    const BATCH_SIZE = 50;
    
    for (let i = 0; i < ldsData.length; i += BATCH_SIZE) {
      const batch = ldsData.slice(i, i + BATCH_SIZE);
      
      try {
        // Update each order in the batch
        for (const item of batch) {
          if (!item.order_no) continue;
          
          const { error } = await supabase
            .from('reports')
            .update({ lds: item.lds })
            .eq('order_no', item.order_no);
          
          if (error) {
            console.error(`Error updating order ${item.order_no}:`, error);
            errorCount++;
          } else {
            updatedCount++;
          }
        }
        
        // Small delay between batches
        if (i + BATCH_SIZE < ldsData.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        console.log(`Processed batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(ldsData.length/BATCH_SIZE)}, updated: ${updatedCount}, errors: ${errorCount}`);
      } catch (error) {
        console.error(`Error processing batch ${Math.floor(i/BATCH_SIZE) + 1}:`, error);
        errorCount += batch.length;
      }
    }
    
    const ordersWithLds = ldsData.filter(item => item.lds && item.lds.trim() !== '').length;
    
    return new Response(
      JSON.stringify({
        success: true,
        totalOrders: allOrders.length, 
        ordersProcessed: ldsData.length,
        ordersWithLdsData: ordersWithLds,
        updatedInDatabase: updatedCount,
        errors: errorCount,
        dateRange: {
          startDate,
          endDate
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `An unexpected error occurred: ${error.message}`
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
