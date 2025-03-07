
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
    
    // STEP 1: Fetch orders directly from OptimoRoute API
    const orders = await fetchAllOrdersWithCompletion(optimoRouteApiKey, startDate, endDate, validStatuses);
    
    if (!orders.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: orders.error || 'Failed to fetch orders from OptimoRoute'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const filteredOrders = orders.data || [];
    console.log(`Found ${filteredOrders.length} orders to process`);
    
    // If no orders found, return early
    if (filteredOrders.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No new orders found to import',
          imported: 0,
          duplicates: 0,
          errors: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // STEP 2: Process orders in parallel using batching
    console.log(`Processing ${filteredOrders.length} orders in parallel batches...`);
    const importResults = await processOrdersInParallel(filteredOrders);
    
    // Compile and return the final results
    const totalResults = {
      success: importResults.successCount > 0 && importResults.errorCount === 0,
      total: filteredOrders.length,
      imported: importResults.importedCount,
      duplicates: importResults.duplicateCount,
      errors: importResults.errorCount,
      errorDetails: importResults.errorDetails
    };
    
    console.log(`Sync complete. Results:`, totalResults);
    
    return new Response(
      JSON.stringify(totalResults),
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

/**
 * Fetches all orders with completion details from OptimoRoute
 */
async function fetchAllOrdersWithCompletion(
  apiKey: string, 
  startDate: string, 
  endDate: string, 
  validStatuses: string[]
): Promise<{ success: boolean, data?: any[], error?: string }> {
  try {
    // Step 1: Call the search_orders API to get base order data
    console.log(`Calling search_orders to get orders from ${startDate} to ${endDate}`);
    
    const requestBody = {
      dateRange: {
        from: startDate,
        to: endDate,
      },
      includeOrderData: true,
      includeScheduleInformation: true
    };
    
    const searchResponse = await fetch(
      `${baseUrl}${endpoints.search}?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('OptimoRoute search_orders error:', errorText);
      return {
        success: false,
        error: `OptimoRoute search_orders API Error (${searchResponse.status}): ${errorText}`
      };
    }
    
    // Parse the search response
    const searchData = await searchResponse.json();
    const allOrders = searchData.orders || [];
    console.log(`Found ${allOrders.length} orders in search results`);
    
    if (allOrders.length === 0) {
      return { success: true, data: [] };
    }
    
    // Step 2: Extract order numbers for completion API call
    const orderNumbers = allOrders
      .filter(order => order.data && order.data.orderNo)
      .map(order => order.data.orderNo);
    
    console.log(`Extracted ${orderNumbers.length} order numbers for completion details`);
    
    if (orderNumbers.length === 0) {
      return { success: true, data: allOrders };
    }
    
    // Step 3: Get completion details
    console.log(`Calling get_completion_details for ${orderNumbers.length} orders`);
    
    const completionResponse = await fetch(
      `${baseUrl}${endpoints.completion}?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderNumbers })
      }
    );
    
    if (!completionResponse.ok) {
      const errorText = await completionResponse.text();
      console.error('OptimoRoute get_completion_details error:', errorText);
      return {
        success: false,
        error: `OptimoRoute get_completion_details API Error (${completionResponse.status}): ${errorText}`
      };
    }
    
    // Parse the completion response
    const completionData = await completionResponse.json();
    const completionOrders = completionData.orders || [];
    console.log(`Got completion details for ${completionOrders.length} orders`);
    
    // Step 4: Create a map for faster lookups
    const completionMap: Record<string, any> = {};
    completionOrders.forEach((order: any) => {
      if (order.orderNo) {
        completionMap[order.orderNo] = order;
      }
    });
    
    // Step 5: Merge search and completion data
    const mergedOrders = allOrders.map(order => {
      const orderNo = order.data?.orderNo;
      const completionDetails = orderNo ? completionMap[orderNo] : null;
      
      return {
        ...order,
        completionDetails,
        search_response: order,
        completion_response: completionDetails ? { success: true, orders: [completionDetails] } : null,
        completion_status: completionDetails?.data?.status || null
      };
    });
    
    // Step 6: Filter by status
    const normalizedValidStatuses = validStatuses.map(status => status.toLowerCase());
    
    const filteredOrders = mergedOrders.filter(order => {
      let status = "unknown";
      
      if (order.completionDetails?.data?.status) {
        status = order.completionDetails.data.status;
      } 
      else if (order.completion_status) {
        status = order.completion_status;
      }
      
      const normalizedStatus = String(status).toLowerCase();
      return normalizedValidStatuses.includes(normalizedStatus);
    });
    
    console.log(`After filtering by status: ${filteredOrders.length} of ${mergedOrders.length} orders remain`);
    
    return { success: true, data: filteredOrders };
    
  } catch (error) {
    console.error('Error fetching orders with completion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Process orders in parallel using batches
 */
async function processOrdersInParallel(orders: any[]) {
  // Define batch size
  const BATCH_SIZE = 50;
  
  // Split orders into batches
  const batches = [];
  for (let i = 0; i < orders.length; i += BATCH_SIZE) {
    batches.push(orders.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`Split ${orders.length} orders into ${batches.length} batches of max ${BATCH_SIZE} orders each`);
  
  // Results accumulator
  const results = {
    importedCount: 0,
    duplicateCount: 0,
    errorCount: 0,
    successCount: 0,
    errorDetails: [] as string[]
  };
  
  // Process each batch in parallel
  const batchPromises = batches.map(async (batch, index) => {
    console.log(`Processing batch ${index + 1} of ${batches.length} with ${batch.length} orders`);
    
    try {
      // Process orders in the current batch
      const batchResults = await processBatch(batch);
      
      // Accumulate results from this batch
      results.importedCount += batchResults.imported;
      results.duplicateCount += batchResults.duplicates;
      results.errorCount += batchResults.errors;
      results.successCount += (batchResults.errors === 0 ? 1 : 0);
      
      if (batchResults.errorDetails && batchResults.errorDetails.length > 0) {
        results.errorDetails = [...results.errorDetails, ...batchResults.errorDetails];
      }
      
      console.log(`Batch ${index + 1} complete: imported=${batchResults.imported}, duplicates=${batchResults.duplicates}, errors=${batchResults.errors}`);
      
    } catch (error) {
      console.error(`Error processing batch ${index + 1}:`, error);
      results.errorCount++;
      results.errorDetails.push(`Batch ${index + 1} error: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  
  // Wait for all batches to complete
  await Promise.all(batchPromises);
  
  console.log(`All batches processed. Final results: imported=${results.importedCount}, duplicates=${results.duplicateCount}, errors=${results.errorCount}`);
  
  return results;
}

/**
 * Process a single batch of orders
 */
async function processBatch(orders: any[]) {
  const results = {
    total: orders.length,
    imported: 0,
    duplicates: 0,
    errors: 0,
    errorDetails: [] as string[]
  };
  
  // Process orders one by one to avoid overwhelming the database
  for (const order of orders) {
    try {
      // Extract unique identifier from various possible locations
      const orderNo = order.order_no || 
                    order.data?.orderNo || 
                    (order.searchResponse && order.searchResponse.data?.orderNo) ||
                    (order.completionDetails && order.completionDetails.orderNo) || 
                    'unknown';
      
      // Check if order already exists by order_no
      const { data: existingOrders, error: checkError } = await adminClient
        .from('work_orders')
        .select('id')
        .eq('order_no', orderNo)
        .maybeSingle();
      
      if (checkError) {
        throw new Error(`Error checking for existing order: ${checkError.message}`);
      }
      
      // If order already exists, count as duplicate and skip
      if (existingOrders) {
        results.duplicates++;
        continue;
      }
      
      // Transform order to match work_orders table schema
      const workOrder = {
        order_no: orderNo,
        status: 'pending_review', // Default status for imported orders
        timestamp: new Date().toISOString(),
        search_response: order.search_response || order, // Store original search data
        completion_response: order.completion_response || order.completionDetails || null // Store completion data if available
      };
      
      // Insert the order into the database
      const { error: insertError } = await adminClient
        .from('work_orders')
        .insert(workOrder);
      
      if (insertError) {
        throw new Error(`Error inserting order: ${insertError.message}`);
      }
      
      results.imported++;
      
    } catch (orderError) {
      console.error(`Error processing order:`, orderError);
      results.errors++;
      results.errorDetails.push(orderError instanceof Error ? orderError.message : String(orderError));
    }
  }
  
  return results;
}
