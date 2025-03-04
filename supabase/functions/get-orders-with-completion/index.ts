
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
    console.log("STEP 1: Calling search_orders API...");
    const searchResult = await fetchSearchOrders(optimoRouteApiKey, startDate, endDate, afterTag);
    
    if (!searchResult.success) {
      console.error("Search API call failed:", searchResult.error);
      return formatErrorResponse(searchResult.error, searchResult.status || 500);
    }
    
    const searchData = searchResult.data;
    console.log("SEARCH API RESPONSE STRUCTURE:", JSON.stringify({
      success: searchData.success,
      ordersCount: searchData.orders?.length,
      firstOrderSample: searchData.orders && searchData.orders.length > 0 ? {
        id: searchData.orders[0].id,
        orderNo: searchData.orders[0].orderNo,
        date: searchData.orders[0].date,
        hasDriver: !!searchData.orders[0].driver,
        hasLocation: !!searchData.orders[0].location,
        status: searchData.orders[0].status,
        keys: Object.keys(searchData.orders[0])
      } : null,
      hasAfterTag: !!searchData.after_tag,
      afterTag: searchData.after_tag,
      fullResponse: searchData
    }, null, 2));
    
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

    // STEP 2: Extract order numbers and prepare for get_completion_details
    console.log("STEP 2: Extracting order numbers for completion details...");
    const orderNumbers = extractOrderNumbers(searchData.orders);
    console.log(`Extracted ${orderNumbers.length} order numbers from search results`);
    console.log("Sample order numbers:", orderNumbers.slice(0, 3));
    console.log("All order numbers:", JSON.stringify(orderNumbers));
    
    // Check if we have any valid order numbers
    if (orderNumbers.length === 0) {
      console.log('No valid order numbers found in search results');
      
      // If we're using pagination and have previous results, continue the pagination
      if (enablePagination && searchData.after_tag && allCollectedOrders.length > 0) {
        // Call ourselves again with the afterTag to get the next page
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

    // STEP 3: Call get_completion_details with the order numbers
    console.log("STEP 3: Calling get_completion_details API...");
    const completionResult = await fetchCompletionDetails(optimoRouteApiKey, orderNumbers);
    
    if (!completionResult.success) {
      console.error("Completion API call failed:", completionResult.error);
      return formatErrorResponse(completionResult.error || "Failed to get completion details", 500);
    }
    
    const completionData = completionResult.data;
    
    console.log("COMPLETION API RESPONSE STRUCTURE:", JSON.stringify({
      success: completionResult.success,
      hasData: !!completionData,
      ordersCount: completionData?.orders?.length,
      firstOrderSample: completionData?.orders && completionData.orders.length > 0 ? {
        id: completionData.orders[0].id,
        orderNo: completionData.orders[0].orderNo,
        status: completionData.orders[0].status,
        hasData: !!completionData.orders[0].data,
        dataStatus: completionData.orders[0].data?.status,
        hasStartTime: !!completionData.orders[0].data?.startTime,
        hasEndTime: !!completionData.orders[0].data?.endTime,
        hasTrackingUrl: !!completionData.orders[0].data?.tracking_url,
        hasForm: !!completionData.orders[0].data?.form,
        dataKeys: completionData.orders[0].data ? Object.keys(completionData.orders[0].data) : []
      } : null,
      fullResponse: completionData
    }, null, 2));

    // STEP 4: Combine the data
    console.log('STEP 4: Combining search results with completion details...');
    
    // Create a map of orderNo to completion details for faster lookups
    const completionMap = createCompletionMap(completionData);
    console.log(`Created completion map with ${Object.keys(completionMap).length} entries`);
    
    // Merge search data with completion data
    const currentPageOrders = mergeOrderData(searchData.orders, completionMap);
    console.log("MERGED DATA STRUCTURE:", JSON.stringify({
      mergedCount: currentPageOrders.length,
      firstOrderSample: currentPageOrders.length > 0 ? {
        id: currentPageOrders[0].id,
        orderNo: currentPageOrders[0].orderNo,
        hasSearch: !!currentPageOrders[0].searchResponse,
        hasCompletion: !!currentPageOrders[0].completionDetails,
        completionSuccess: currentPageOrders[0].completionDetails?.success,
        completionDataStatus: currentPageOrders[0].completionDetails?.data?.status,
        hasStartTime: !!currentPageOrders[0].completionDetails?.data?.startTime,
        hasEndTime: !!currentPageOrders[0].completionDetails?.data?.endTime,
        keys: Object.keys(currentPageOrders[0])
      } : null,
      allKeys: currentPageOrders.length > 0 ? Object.keys(currentPageOrders[0]) : []
    }, null, 2));

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
