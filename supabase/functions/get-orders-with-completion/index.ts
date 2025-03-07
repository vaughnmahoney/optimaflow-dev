import { corsHeaders } from '../_shared/cors.ts';
import { extractOrderNumbers, createCompletionMap, mergeOrderData, filterOrdersByStatus } from '../_shared/optimoroute.ts';
import { fetchSearchOrders } from './search-service.ts';
import { fetchCompletionDetails } from './completion-service.ts';
import { formatSuccessResponse, formatErrorResponse } from './response-formatter.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Supabase client with the service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate, endDate, validStatuses = ['success', 'failed', 'rejected'], saveToDatabase = false } = await req.json();
    console.log(`Fetching orders with completion data from ${startDate} to ${endDate}`);
    console.log(`Filtering orders by statuses: ${validStatuses.join(', ')}`);
    console.log(`Save to database: ${saveToDatabase}`);
    
    // Validate required inputs
    if (!startDate || !endDate) {
      return formatErrorResponse('Missing required parameters: startDate and endDate are required', 400);
    }
    
    if (!optimoRouteApiKey) {
      return formatErrorResponse('OptimoRoute API key is not configured', 500);
    }

    // Validate database configuration if saving to database
    if (saveToDatabase && (!supabaseUrl || !supabaseServiceKey)) {
      return formatErrorResponse('Supabase configuration is missing', 500);
    }

    // STEP 1: Collect ALL search results using pagination
    console.log("STEP 1: Collecting ALL search results using pagination...");
    const allSearchOrders = await collectAllSearchResults(optimoRouteApiKey, startDate, endDate);
    
    if (!allSearchOrders.success) {
      console.error("Failed to collect all search results:", allSearchOrders.error);
      return formatErrorResponse(allSearchOrders.error, 500);
    }
    
    const allOrdersFromSearch = allSearchOrders.orders;
    console.log(`Successfully collected ${allOrdersFromSearch.length} orders from all search pages`);
    
    // If no orders found across all pages, return empty result
    if (allOrdersFromSearch.length === 0) {
      console.log("No orders found in search results");
      const formattedResponse = formatSuccessResponse(
        [], // Empty orders array
        {
          unfilteredOrderCount: 0,
          filteredOrderCount: 0,
          completionDetailCount: 0
        },
        true // isComplete = true
      );
      return formattedResponse.response;
    }

    // STEP 2: Extract unique order numbers from ALL collected search results
    console.log("STEP 2: Extracting unique order numbers from all search results...");
    const uniqueOrderNumbers = extractUniqueOrderNumbers(allOrdersFromSearch);
    console.log(`Extracted ${uniqueOrderNumbers.length} unique order numbers from ${allOrdersFromSearch.length} search results`);
    
    // If no valid order numbers found, return search data without completion details
    if (uniqueOrderNumbers.length === 0) {
      console.log('No valid order numbers found in search results');
      const formattedResponse = formatSuccessResponse(
        allOrdersFromSearch, // Return original search data
        {
          unfilteredOrderCount: allOrdersFromSearch.length,
          filteredOrderCount: 0,
          completionDetailCount: 0
        },
        true // isComplete = true
      );
      return formattedResponse.response;
    }

    // STEP 3: Make a BATCHED call to get completion details for ALL unique order numbers
    console.log("STEP 3: Calling get_completion_details API with batched order numbers...");
    const completionResult = await fetchCompletionDetails(optimoRouteApiKey, uniqueOrderNumbers);
    
    if (!completionResult.success) {
      console.error("Completion API call failed:", completionResult.error);
      return formatErrorResponse(completionResult.error || "Failed to get completion details", 500);
    }
    
    const completionData = completionResult.data;
    console.log(`Got completion details for ${completionData?.orders?.length || 0} orders across batches`);
    
    // Create batch stats for response
    const batchStats = {
      totalBatches: Math.ceil(uniqueOrderNumbers.length / 500),
      completedBatches: completionResult.success ? 1 : 0,
      successfulBatches: completionResult.success ? 1 : 0,
      failedBatches: completionResult.success ? 0 : 1,
      totalOrdersProcessed: completionData?.orders?.length || 0,
      errors: completionResult.errors
    };
    
    // STEP 4: Combine search data with completion details
    console.log('STEP 4: Combining search results with completion details...');
    
    // Create a map of orderNo to completion details for faster lookups
    const completionMap = createCompletionMap(completionData);
    console.log(`Created completion map with ${Object.keys(completionMap).length} entries`);
    
    // Merge search data with completion data
    const mergedOrders = mergeOrderData(allOrdersFromSearch, completionMap);
    console.log(`Successfully merged data for ${mergedOrders.length} orders`);
    
    // STEP 5: Filter orders by status ONCE
    console.log('STEP 5: Filtering final merged dataset by status...');
    const filteredOrders = filterOrdersByStatus(mergedOrders, validStatuses);
    console.log(`After status filtering: ${filteredOrders.length} orders of ${mergedOrders.length} total remain`);
    
    // STEP 6: Save to database if requested
    let savedStats = { total: 0, successful: 0, failed: 0, errors: [] };
    
    if (saveToDatabase && filteredOrders.length > 0) {
      console.log('STEP 6: Saving filtered orders to database...');
      savedStats = await saveOrdersToDatabase(filteredOrders);
      console.log(`Database save complete: ${savedStats.successful} saved, ${savedStats.failed} failed`);
    } else if (saveToDatabase) {
      console.log('No filtered orders to save to database');
    } else {
      console.log('Skipping database save as saveToDatabase=false');
    }
    
    // STEP 7: Return the FINAL filtered dataset with batch stats
    console.log('STEP 7: Returning final filtered dataset with batch stats...');
    
    // Use the response formatter to get the response data object
    const formattedResponse = formatSuccessResponse(
      filteredOrders,
      {
        unfilteredOrderCount: allOrdersFromSearch.length,
        filteredOrderCount: filteredOrders.length,
        completionDetailCount: completionData?.orders?.length || 0
      },
      true // isComplete = true
    );
    
    // Add batch stats and database save stats to the data object
    const responseData = formattedResponse.data;
    responseData.batchStats = batchStats;
    
    if (saveToDatabase) {
      responseData.dbSaveStats = savedStats;
    }
    
    // Return the response with the updated data
    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing order request:', error);
    return formatErrorResponse(error instanceof Error ? error.message : String(error));
  }
});

/**
 * Collects all search results by handling pagination internally
 * Returns all orders from all pages in a single array
 */
async function collectAllSearchResults(apiKey: string, startDate: string, endDate: string) {
  let allOrders: any[] = [];
  let currentAfterTag: string | undefined = undefined;
  let pageCount = 0;
  let hasMorePages = true;
  
  console.log("Starting to collect all search results across pages");
  
  while (hasMorePages) {
    pageCount++;
    console.log(`Fetching search page ${pageCount}${currentAfterTag ? ` with after_tag: ${currentAfterTag}` : ''}`);
    
    // Call the search API
    const searchResult = await fetchSearchOrders(apiKey, startDate, endDate, currentAfterTag);
    
    if (!searchResult.success) {
      console.error(`Failed on page ${pageCount}:`, searchResult.error);
      return { success: false, error: searchResult.error, orders: allOrders };
    }
    
    const searchData = searchResult.data;
    const pageOrders = searchData.orders || [];
    console.log(`Page ${pageCount} returned ${pageOrders.length} orders`);
    
    // Add this page's orders to our collection
    allOrders = [...allOrders, ...pageOrders];
    console.log(`Total orders collected so far: ${allOrders.length}`);
    
    // Check if there are more pages
    if (searchData.after_tag) {
      currentAfterTag = searchData.after_tag;
      console.log(`More pages available, next after_tag: ${currentAfterTag}`);
    } else {
      hasMorePages = false;
      console.log("No more pages available, pagination complete");
    }
    
    // Safety limit - don't fetch more than 50 pages (25,000 orders)
    if (pageCount >= 50) {
      console.warn("Reached maximum page limit (50), stopping pagination");
      hasMorePages = false;
    }
  }
  
  console.log(`Pagination complete. Collected ${allOrders.length} orders across ${pageCount} pages`);
  return { success: true, orders: allOrders };
}

/**
 * Extracts unique order numbers from an array of search orders
 * Handles the nested structure of the OptimoRoute API response
 */
function extractUniqueOrderNumbers(orders: any[]): string[] {
  if (!orders || orders.length === 0) {
    return [];
  }
  
  // Use a Set to automatically handle uniqueness
  const uniqueOrderNumbers = new Set<string>();
  
  orders.forEach(order => {
    // Check if orderNo exists in the expected data property
    if (order.data && order.data.orderNo) {
      uniqueOrderNumbers.add(order.data.orderNo);
    }
  });
  
  return Array.from(uniqueOrderNumbers);
}

/**
 * Save orders to the database in parallel batches
 * @param orders The orders to save
 * @returns Statistics about the save operation
 */
async function saveOrdersToDatabase(orders: any[]) {
  const stats = { total: orders.length, successful: 0, failed: 0, errors: [] };
  console.log(`Attempting to save ${orders.length} orders to database`);
  
  // Create batches of orders (50 per batch to avoid overloading the database)
  const BATCH_SIZE = 50;
  const batches: any[][] = [];
  
  for (let i = 0; i < orders.length; i += BATCH_SIZE) {
    batches.push(orders.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`Split ${orders.length} orders into ${batches.length} batches of max ${BATCH_SIZE} orders each`);
  
  // Process all batches in parallel
  const results = await Promise.all(
    batches.map(async (batch, batchIndex) => {
      const batchStats = { successful: 0, failed: 0, errors: [] as { orderNo: string, error: string }[] };
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} orders`);
      
      // Process each order in the batch
      const batchPromises = batch.map(async (order) => {
        try {
          // Extract necessary data from the order
          const orderNo = order.data?.orderNo || order.orderNo || 'unknown';
          
          // Prepare order data for database
          const orderData = {
            order_no: orderNo,
            service_date: order.data?.date || null,
            location: {
              name: order.data?.location?.locationName || order.data?.location?.name || null,
              address: order.data?.location?.address || null,
            },
            driver: {
              name: order.scheduleInformation?.driverName || null,
              id: order.scheduleInformation?.driverId || null,
            },
            search_response: order,
            completion_response: order.completionDetails || null,
            status: 'pending_review', // Default status for imported orders
            synced_at: new Date().toISOString(),
          };
          
          // Insert or update the order in the database
          const { error } = await supabase
            .from('work_orders')
            .upsert(orderData, { 
              onConflict: 'order_no',
              ignoreDuplicates: false // Update existing entries
            });
          
          if (error) {
            throw error;
          }
          
          batchStats.successful++;
          return { success: true, orderNo };
        } catch (error) {
          console.error(`Error saving order:`, error);
          
          const orderNo = order.data?.orderNo || order.orderNo || 'unknown';
          batchStats.failed++;
          batchStats.errors.push({ 
            orderNo, 
            error: error instanceof Error ? error.message : String(error) 
          });
          
          return { success: false, orderNo, error };
        }
      });
      
      // Wait for all orders in the batch to be processed
      await Promise.all(batchPromises);
      
      console.log(`Batch ${batchIndex + 1} complete: ${batchStats.successful} saved, ${batchStats.failed} failed`);
      return batchStats;
    })
  );
  
  // Aggregate results from all batches
  results.forEach(batchStats => {
    stats.successful += batchStats.successful;
    stats.failed += batchStats.failed;
    stats.errors = [...stats.errors, ...batchStats.errors];
  });
  
  return stats;
}
