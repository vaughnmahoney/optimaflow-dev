
import { corsHeaders } from '../_shared/cors.ts';
import { extractOrderNumbers, createCompletionMap, mergeOrderData } from '../_shared/optimoroute.ts';
import { fetchSearchOrders } from './search-service.ts';
import { fetchCompletionDetails } from './completion-service.ts';
import { formatSuccessResponse, formatErrorResponse } from './response-formatter.ts';

const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate, endDate, enablePagination, afterTag, allCollectedOrders = [], validStatuses = ['success', 'failed', 'rejected'] } = await req.json();
    console.log(`Fetching orders with completion data from ${startDate} to ${endDate}`);
    console.log(`Pagination enabled: ${enablePagination}, afterTag: ${afterTag || 'none'}`);
    console.log(`Previously collected orders: ${allCollectedOrders.length}`);
    console.log(`Filtering orders by statuses: ${validStatuses.join(', ')}`);
    
    // Validate required inputs
    if (!startDate || !endDate) {
      return formatErrorResponse('Missing required parameters: startDate and endDate are required', 400);
    }
    
    if (!optimoRouteApiKey) {
      return formatErrorResponse('OptimoRoute API key is not configured', 500);
    }

    // STEP 1: Call search_orders to get all orders in date range
    console.log("STEP 1: Calling search_orders API...");
    const searchResult = await fetchSearchOrders(optimoRouteApiKey, startDate, endDate, afterTag);
    
    if (!searchResult.success) {
      console.error("Search API call failed:", searchResult.error);
      return formatErrorResponse(searchResult.error, searchResult.status || 500);
    }
    
    const searchData = searchResult.data;
    console.log(`Search API returned ${searchData.orders?.length || 0} orders`);
    
    // If no orders found on this page, return what we've collected so far or empty result
    if (!searchData.orders || searchData.orders.length === 0) {
      console.log("No orders found in search results, returning early");
      return formatSuccessResponse(
        allCollectedOrders, 
        [], 
        searchData, 
        null, 
        true // isComplete = true
      );
    }

    // STEP 2: Extract order numbers for all orders (no status filtering)
    console.log("STEP 2: Extracting order numbers...");
    const orderNumbers = extractOrderNumbers(searchData.orders);
    console.log(`Extracted ${orderNumbers.length} order numbers`);
    
    // Check if we have any order numbers
    if (orderNumbers.length === 0) {
      console.log('No valid order numbers found in search results');
      
      // If we're using pagination and have previous results, continue the pagination
      if (enablePagination && searchData.after_tag && allCollectedOrders.length > 0) {
        console.log("No valid order numbers but pagination enabled, continuing...");
        return formatSuccessResponse(
          allCollectedOrders,
          allCollectedOrders,
          searchData,
          null,
          false // isComplete = false
        );
      }
      
      return formatSuccessResponse(
        searchData.orders, // Return search data even without completion details
        [],
        searchData,
        null,
        true // isComplete = true
      );
    }

    // STEP 3: Call get_completion_details with all order numbers
    console.log("STEP 3: Calling get_completion_details API...");
    const completionResult = await fetchCompletionDetails(optimoRouteApiKey, orderNumbers);
    
    if (!completionResult.success) {
      console.error("Completion API call failed:", completionResult.error);
      return formatErrorResponse(completionResult.error || "Failed to get completion details", 500);
    }
    
    const completionData = completionResult.data;
    console.log(`Got completion details for ${completionData?.orders?.length || 0} orders`);
    
    // STEP 4: Combine the data
    console.log('STEP 4: Combining search results with completion details...');
    
    // Create a map of orderNo to completion details for faster lookups
    const completionMap = createCompletionMap(completionData);
    console.log(`Created completion map with ${Object.keys(completionMap).length} entries`);
    
    // Merge search data with completion data
    const currentPageOrders = mergeOrderData(searchData.orders, completionMap);
    console.log(`Successfully merged data for ${currentPageOrders.length} orders`);
    
    // Combine with previously collected orders if we're paginating
    const combinedOrders = [...allCollectedOrders, ...currentPageOrders];
    console.log(`Combined with previous orders: ${combinedOrders.length} total orders`);
    
    // Handle pagination if enabled and we have more pages
    const isComplete = !(enablePagination && searchData.after_tag);
    
    if (!isComplete) {
      console.log(`This is page ${Math.ceil(allCollectedOrders.length / 500) + 1}, more pages available.`);
      console.log(`API returned after_tag: ${searchData.after_tag}`);
    } else {
      console.log("Final page reached or pagination complete");
    }
    
    return formatSuccessResponse(
      combinedOrders,
      allCollectedOrders,
      searchData,
      completionData,
      isComplete
    );

  } catch (error) {
    console.error('Error processing order request:', error);
    return formatErrorResponse(error instanceof Error ? error.message : String(error));
  }
});
