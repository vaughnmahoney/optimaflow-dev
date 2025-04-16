
import { corsHeaders } from '../_shared/cors.ts';
import { extractOrderNumbers, createCompletionMap, mergeOrderData, filterOrdersByStatus } from '../_shared/optimoroute.ts';
import { fetchSearchOrders } from './search-service.ts';
import { fetchCompletionDetails } from './completion-service.ts';
import { formatSuccessResponse, formatErrorResponse } from './response-formatter.ts';

const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
const BATCH_SIZE = 500; // Default batch size

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      startDate, 
      endDate, 
      validStatuses = ['success', 'failed', 'rejected'],
      continuationToken = null,
      batchSize = BATCH_SIZE
    } = await req.json();

    console.log(`Fetching orders with completion data from ${startDate} to ${endDate}`);
    console.log(`Filtering orders by statuses: ${validStatuses.join(', ')}`);
    console.log(`Continuation token: ${continuationToken || 'INITIAL'}`);
    
    // Validate required inputs
    if (!startDate || !endDate) {
      return formatErrorResponse('Missing required parameters: startDate and endDate are required', 400);
    }
    
    if (!optimoRouteApiKey) {
      return formatErrorResponse('OptimoRoute API key is not configured', 500);
    }

    // Parse continuation token if present
    let parsedToken = null;
    if (continuationToken) {
      try {
        parsedToken = JSON.parse(atob(continuationToken));
        console.log("Parsed continuation token:", parsedToken);
      } catch (error) {
        console.error("Error parsing continuation token:", error);
        return formatErrorResponse('Invalid continuation token', 400);
      }
    }

    // STEP 1: Get the search results for the current page
    console.log("STEP 1: Collecting search results for the current page...");
    const searchResult = await getSearchResultsPage(
      optimoRouteApiKey, 
      startDate, 
      endDate, 
      parsedToken?.searchAfterTag
    );
    
    if (!searchResult.success) {
      console.error("Failed to get search results:", searchResult.error);
      return formatErrorResponse(searchResult.error, 500);
    }
    
    const searchData = searchResult.data;
    const pageOrders = searchData.orders || [];
    console.log(`Retrieved ${pageOrders.length} orders from search API`);

    // Extract pagination info
    const hasMorePages = !!searchData.after_tag;
    const searchAfterTag = searchData.after_tag;
    
    // If no orders found on this page, check if there are more pages
    if (pageOrders.length === 0) {
      if (hasMorePages) {
        // No orders on this page, but more pages exist, return continuation token for next page
        const newToken = btoa(JSON.stringify({ 
          searchAfterTag,
          page: (parsedToken?.page || 0) + 1
        }));
        
        // Format response with empty orders and continuation token
        const formattedResponse = formatSuccessResponse(
          [], // Empty orders array
          {
            unfilteredOrderCount: 0,
            filteredOrderCount: 0,
            completionDetailCount: 0
          },
          false, // isComplete = false
          newToken,
          (parsedToken?.page || 0) + 1
        );
        return formattedResponse.response;
      } else {
        // No orders on this page and no more pages, we're done
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
    }

    // STEP 2: Extract order numbers from this page's results
    console.log("STEP 2: Extracting order numbers from search results...");
    const orderNumbers = extractOrderNumbers(pageOrders);
    console.log(`Extracted ${orderNumbers.length} order numbers from ${pageOrders.length} search results`);
    
    if (orderNumbers.length === 0) {
      // No valid order numbers found on this page
      if (hasMorePages) {
        // Try next page
        const newToken = btoa(JSON.stringify({ 
          searchAfterTag,
          page: (parsedToken?.page || 0) + 1
        }));
        
        const formattedResponse = formatSuccessResponse(
          [], // Empty orders array
          {
            unfilteredOrderCount: pageOrders.length,
            filteredOrderCount: 0,
            completionDetailCount: 0
          },
          false, // isComplete = false
          newToken,
          (parsedToken?.page || 0) + 1
        );
        return formattedResponse.response;
      } else {
        // No valid order numbers and no more pages, we're done
        const formattedResponse = formatSuccessResponse(
          [], // Empty orders array
          {
            unfilteredOrderCount: pageOrders.length,
            filteredOrderCount: 0,
            completionDetailCount: 0
          },
          true // isComplete = true
        );
        return formattedResponse.response;
      }
    }

    // STEP 3: Get completion details for this page's orders
    console.log("STEP 3: Getting completion details for the order numbers...");
    const completionResult = await fetchCompletionDetails(optimoRouteApiKey, orderNumbers);
    
    if (!completionResult.success) {
      console.error("Completion API call failed:", completionResult.error);
      return formatErrorResponse(completionResult.error || "Failed to get completion details", 500);
    }
    
    // Create batch stats
    const batchStats = {
      completedBatch: 1,
      totalOrdersProcessed: orderNumbers.length
    };
    
    // STEP 4: Combine search data with completion details
    console.log('STEP 4: Combining search results with completion details...');
    
    const completionData = completionResult.data;
    console.log(`Got completion details for ${completionData?.orders?.length || 0} orders`);
    
    // Create a map of orderNo to completion details for faster lookups
    const completionMap = createCompletionMap(completionData);
    console.log(`Created completion map with ${Object.keys(completionMap).length} entries`);
    
    // Merge search data with completion data
    const mergedOrders = mergeOrderData(pageOrders, completionMap);
    console.log(`Successfully merged data for ${mergedOrders.length} orders`);
    
    // STEP 5: Filter orders by status
    console.log('STEP 5: Filtering merged dataset by status...');
    const filteredOrders = filterOrdersByStatus(mergedOrders, validStatuses);
    console.log(`After status filtering: ${filteredOrders.length} orders of ${mergedOrders.length} total remain`);
    
    // STEP 6: Prepare the response
    console.log('STEP 6: Preparing the response...');
    
    // Calculate if we're on the last page
    const isComplete = !hasMorePages;
    
    // Create continuation token for next page if not complete
    let nextContinuationToken = null;
    if (!isComplete) {
      nextContinuationToken = btoa(JSON.stringify({ 
        searchAfterTag,
        page: (parsedToken?.page || 0) + 1
      }));
    }
    
    // Use the response formatter to get the response data object
    const formattedResponse = formatSuccessResponse(
      filteredOrders,
      {
        unfilteredOrderCount: pageOrders.length,
        filteredOrderCount: filteredOrders.length,
        completionDetailCount: completionData?.orders?.length || 0
      },
      isComplete,
      nextContinuationToken,
      (parsedToken?.page || 0) + 1
    );
    
    // Add batch stats to the data object
    const responseData = formattedResponse.data;
    responseData.batchStats = batchStats;
    
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
 * Gets search results for a single page
 */
async function getSearchResultsPage(
  apiKey: string, 
  startDate: string, 
  endDate: string, 
  afterTag?: string
) {
  try {
    console.log(`Fetching search page with after_tag: ${afterTag || 'INITIAL'}`);
    
    // Call the search API
    const searchResult = await fetchSearchOrders(apiKey, startDate, endDate, afterTag);
    
    if (!searchResult.success) {
      console.error(`Failed to fetch search page:`, searchResult.error);
      return { success: false, error: searchResult.error };
    }
    
    return { success: true, data: searchResult.data };
  } catch (error) {
    console.error('Error fetching search page:', error);
    return { success: false, error: String(error) };
  }
}
