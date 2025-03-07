
import { corsHeaders } from '../_shared/cors.ts';
import { baseUrl, endpoints } from '../_shared/optimoroute.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// Create a Supabase client with the admin role
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// OptimoRoute API key from environment
const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate, endDate, validStatuses = ['success', 'failed', 'rejected'] } = await req.json();
    
    // Validate required inputs
    if (!startDate || !endDate) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: startDate and endDate are required'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!optimoRouteApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OptimoRoute API key is not configured'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Syncing orders from ${startDate} to ${endDate} with statuses: ${validStatuses.join(', ')}`);
    
    // Get all orders from OptimoRoute using pagination
    let allOrders = [];
    let hasMorePages = true;
    let afterTag = null;
    let page = 1;

    try {
      console.log(`Starting paginated fetch of orders from OptimoRoute...`);
      
      while (hasMorePages && page <= 5) { // Limit to 5 pages for safety
        console.log(`Fetching page ${page}${afterTag ? ` with afterTag ${afterTag}` : ''}...`);
        
        const searchResponse = await fetch(
          `${baseUrl}${endpoints.search}?key=${optimoRouteApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dateRange: {
                from: startDate,
                to: endDate,
              },
              includeOrderData: true,
              includeScheduleInformation: true,
              after_tag: afterTag
            })
          }
        );
        
        if (!searchResponse.ok) {
          throw new Error(`OptimoRoute search_orders API Error (${searchResponse.status}): ${await searchResponse.text()}`);
        }
        
        const searchData = await searchResponse.json();
        const pageOrders = searchData.orders || [];
        
        console.log(`Page ${page} returned ${pageOrders.length} orders`);
        allOrders = [...allOrders, ...pageOrders];
        
        // Check if there are more pages
        if (searchData.after_tag) {
          afterTag = searchData.after_tag;
          page++;
        } else {
          hasMorePages = false;
        }
      }
      
      console.log(`Total orders collected: ${allOrders.length}`);
    } catch (searchError) {
      console.error('Error fetching orders from OptimoRoute:', searchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error fetching orders: ${searchError.message}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Extract order numbers
    const orderNumbers = allOrders
      .filter(order => order.data && order.data.orderNo)
      .map(order => order.data.orderNo);
    
    if (orderNumbers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No orders found to process',
          imported: 0,
          duplicates: 0,
          errors: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${orderNumbers.length} order numbers for completion details`);
    
    // Process in batches of 100 order numbers
    const BATCH_SIZE = 100;
    const orderBatches = [];
    
    for (let i = 0; i < orderNumbers.length; i += BATCH_SIZE) {
      orderBatches.push(orderNumbers.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Split ${orderNumbers.length} orders into ${orderBatches.length} batches for completion details`);
    
    // Process each batch to get completion details and save to database
    const results = {
      total: allOrders.length,
      imported: 0,
      duplicates: 0,
      errors: 0,
      errorDetails: [] as string[]
    };
    
    console.log(`Processing ${orderBatches.length} batches sequentially...`);
    
    for (let batchIndex = 0; batchIndex < orderBatches.length; batchIndex++) {
      const currentBatch = orderBatches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1} of ${orderBatches.length} with ${currentBatch.length} orders...`);
      
      try {
        // Get completion details for this batch
        const completionResponse = await fetch(
          `${baseUrl}${endpoints.completion}?key=${optimoRouteApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderNumbers: currentBatch })
          }
        );
        
        if (!completionResponse.ok) {
          throw new Error(`OptimoRoute get_completion_details API Error (${completionResponse.status}): ${await completionResponse.text()}`);
        }
        
        const completionData = await completionResponse.json();
        const completionOrders = completionData.orders || [];
        console.log(`Got completion details for ${completionOrders.length} orders in batch ${batchIndex + 1}`);
        
        // Create a map of orderNo to completion details
        const completionMap: Record<string, any> = {};
        completionOrders.forEach((order: any) => {
          if (order.orderNo) {
            completionMap[order.orderNo] = order;
          }
        });
        
        // Find matching orders in the original search results
        const batchOrdersToSave = [];
        
        for (const orderNo of currentBatch) {
          const completionDetails = completionMap[orderNo];
          if (!completionDetails) continue;
          
          // Find the search order data
          const searchOrder = allOrders.find(o => o.data?.orderNo === orderNo);
          if (!searchOrder) continue;
          
          // Check if the status matches our filter
          const status = completionDetails.data?.status || '';
          if (!validStatuses.includes(status.toLowerCase())) continue;
          
          // Add to batch for saving
          batchOrdersToSave.push({
            searchOrder,
            completionDetails
          });
        }
        
        console.log(`Found ${batchOrdersToSave.length} valid orders to save in batch ${batchIndex + 1}`);
        
        // Save these orders to the database in smaller chunks
        if (batchOrdersToSave.length > 0) {
          const DB_BATCH_SIZE = 10;
          const dbBatches = [];
          
          for (let i = 0; i < batchOrdersToSave.length; i += DB_BATCH_SIZE) {
            dbBatches.push(batchOrdersToSave.slice(i, i + DB_BATCH_SIZE));
          }
          
          console.log(`Split ${batchOrdersToSave.length} orders into ${dbBatches.length} database batches`);
          
          for (let dbBatchIndex = 0; dbBatchIndex < dbBatches.length; dbBatchIndex++) {
            const dbBatch = dbBatches[dbBatchIndex];
            console.log(`Processing database batch ${dbBatchIndex + 1} of ${dbBatches.length}...`);
            
            for (const order of dbBatch) {
              try {
                const orderNo = order.completionDetails.orderNo;
                
                // Check if order already exists
                const { data: existingOrder } = await adminClient
                  .from('work_orders')
                  .select('id')
                  .eq('order_no', orderNo)
                  .maybeSingle();
                
                if (existingOrder) {
                  results.duplicates++;
                  continue;
                }
                
                // Prepare data for insertion
                const workOrderData = {
                  order_no: orderNo,
                  status: 'pending_review',
                  service_date: order.searchOrder.data?.date || null,
                  location: {
                    name: order.searchOrder.data?.location?.locationName || order.searchOrder.data?.location?.name || null,
                    address: order.searchOrder.data?.location?.address || null,
                  },
                  driver: {
                    name: order.searchOrder.scheduleInformation?.driverName || null,
                    id: order.searchOrder.scheduleInformation?.driverId || null,
                  },
                  search_response: order.searchOrder,
                  completion_response: { success: true, orders: [order.completionDetails] },
                  synced_at: new Date().toISOString(),
                };
                
                // Insert the work order
                const { error: insertError } = await adminClient
                  .from('work_orders')
                  .insert(workOrderData);
                
                if (insertError) {
                  throw new Error(`Error inserting order ${orderNo}: ${insertError.message}`);
                }
                
                results.imported++;
              } catch (orderError) {
                console.error(`Error processing order:`, orderError);
                results.errors++;
                results.errorDetails.push(orderError instanceof Error ? orderError.message : String(orderError));
              }
            }
          }
        }
        
      } catch (batchError) {
        console.error(`Error processing batch ${batchIndex + 1}:`, batchError);
        results.errors += currentBatch.length;
        results.errorDetails.push(`Batch ${batchIndex + 1} error: ${batchError instanceof Error ? batchError.message : String(batchError)}`);
      }
      
      // Add a small delay between batches to prevent rate limiting
      if (batchIndex < orderBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`Sync complete. Results: imported=${results.imported}, duplicates=${results.duplicates}, errors=${results.errors}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        errorDetails: results.errorDetails.slice(0, 10) // Only send the first 10 errors to keep response size reasonable
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Error in sync-work-orders:`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred',
        imported: 0,
        duplicates: 0,
        errors: 1,
        errorDetails: [error.message]
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
