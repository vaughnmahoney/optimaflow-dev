
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
    const { startDate, endDate, enablePagination, afterTag, allCollectedOrders = [] } = await req.json();
    console.log(`Fetching orders with completion data from ${startDate} to ${endDate}`);
    console.log(`Pagination enabled: ${enablePagination}, afterTag: ${afterTag || 'none'}`);
    console.log(`Previously collected orders: ${allCollectedOrders.length}`);
    
    // Validate required inputs
    if (!startDate || !endDate) {
      return formatErrorResponse('Missing required parameters: startDate and endDate are required', 400);
    }
    
    if (!optimoRouteApiKey) {
      return formatErrorResponse('OptimoRoute API key is not configured', 500);
    }

    // STEP 1: Call search_orders to get all orders in date range
    const searchResult = await fetchSearchOrders(optimoRouteApiKey, startDate, endDate, afterTag);
    
    if (!searchResult.success) {
      return formatErrorResponse(searchResult.error, searchResult.status || 500);
    }
    
    const searchData = searchResult.data;
    
    // If no orders found on this page, return what we've collected so far or empty result
    if (!searchData.orders || searchData.orders.length === 0) {
      return formatSuccessResponse(
        allCollectedOrders, 
        [], 
        searchData, 
        null, 
        true // isComplete = true
      );
    }

    // STEP 2: Extract order numbers and prepare for get_completion_details
    const orderNumbers = extractOrderNumbers(searchData.orders);
    
    // Check if we have any valid order numbers
    if (orderNumbers.length === 0) {
      console.log('No valid order numbers found in search results');
      
      // If we're using pagination and have previous results, continue the pagination
      if (enablePagination && searchData.after_tag && allCollectedOrders.length > 0) {
        // Call ourselves again with the afterTag to get the next page
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

    // STEP 3: Call get_completion_details with the order numbers
    const completionResult = await fetchCompletionDetails(optimoRouteApiKey, orderNumbers);
    const completionData = completionResult.data;

    // STEP 4: Combine the data
    console.log('Combining search results with completion details...');
    
    // Create a map of orderNo to completion details for faster lookups
    const completionMap = createCompletionMap(completionData);
    
    // Merge search data with completion data
    const currentPageOrders = mergeOrderData(searchData.orders, completionMap);

    // Combine with previously collected orders if we're paginating
    const combinedOrders = [...allCollectedOrders, ...currentPageOrders];
    console.log(`Successfully combined data: ${currentPageOrders.length} new orders, ${combinedOrders.length} total orders`);
    
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
