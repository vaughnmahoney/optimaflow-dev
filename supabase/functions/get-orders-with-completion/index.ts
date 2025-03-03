import { corsHeaders } from '../_shared/cors.ts';

const optimoRouteApiKey = Deno.env.get('OPTIMOROUTE_API_KEY');
const baseUrl = 'https://api.optimoroute.com/v1';

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
    
    if (!startDate || !endDate) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: startDate and endDate are required',
          success: false 
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
          error: 'OptimoRoute API key is not configured',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Step 1: Calling search_orders to get order numbers...');
    
    // STEP 1: Call search_orders to get all orders in date range
    const searchRequestBody: any = {
      dateRange: {
        from: startDate,
        to: endDate,
      },
      includeOrderData: true,
      includeScheduleInformation: true
    };
    
    // Add afterTag for pagination if provided - now correctly using after_tag
    if (afterTag) {
      searchRequestBody.after_tag = afterTag;
      console.log(`Including after_tag in request: ${afterTag}`);
    }
    
    const searchResponse = await fetch(
      `${baseUrl}/search_orders?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchRequestBody)
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('OptimoRoute search_orders error:', searchResponse.status, errorText);
      
      return new Response(
        JSON.stringify({
          error: `OptimoRoute search_orders API Error (${searchResponse.status}): ${errorText}`,
          success: false
        }),
        { 
          status: searchResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse search response
    const searchData = await searchResponse.json();
    console.log(`Found ${searchData.orders?.length || 0} orders on current page`);
    console.log(`After tag present: ${!!searchData.after_tag}`); // Use after_tag from API
    
    // If no orders found on this page, return what we've collected so far or empty result
    if (!searchData.orders || searchData.orders.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          orders: allCollectedOrders,
          totalCount: allCollectedOrders.length,
          paginationProgress: {
            currentPage: 1,
            totalOrdersRetrieved: allCollectedOrders.length,
            isComplete: true
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // STEP 2: Extract order numbers and prepare for get_completion_details
    const orderNumbers = searchData.orders
      .filter(order => order?.data?.orderNo) // Make sure orderNo exists
      .map(order => ({ orderNo: order.data.orderNo }));
    
    console.log(`Step 2: Calling get_completion_details for ${orderNumbers.length} orders...`);
    
    // Check if we have any valid order numbers
    if (orderNumbers.length === 0) {
      console.log('No valid order numbers found in search results');
      
      // If we're using pagination and have previous results, continue the pagination
      // Now using after_tag from the API response
      if (enablePagination && searchData.after_tag && allCollectedOrders.length > 0) {
        // Call ourselves again with the afterTag to get the next page
        return new Response(
          JSON.stringify({
            success: true,
            orders: allCollectedOrders,
            totalCount: allCollectedOrders.length,
            after_tag: searchData.after_tag, // Include original after_tag from API
            paginationProgress: {
              currentPage: allCollectedOrders.length > 0 ? Math.ceil(allCollectedOrders.length / 500) + 1 : 1,
              totalOrdersRetrieved: allCollectedOrders.length,
              isComplete: false,
              afterTag: searchData.after_tag // Also store in our internal camelCase format
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          orders: searchData.orders, // Return search data even without completion details
          totalCount: searchData.orders.length,
          completionDetails: null,
          paginationProgress: {
            currentPage: 1,
            totalOrdersRetrieved: searchData.orders.length,
            isComplete: true
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // STEP 3: Call get_completion_details with the order numbers
    const completionRequestBody = {
      orders: orderNumbers
    };
    
    const completionResponse = await fetch(
      `${baseUrl}/get_completion_details?key=${optimoRouteApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completionRequestBody)
      }
    );

    // Get the raw response for potential error analysis
    const completionResponseText = await completionResponse.text();
    
    let completionData;
    try {
      // Try to parse as JSON
      completionData = JSON.parse(completionResponseText);
    } catch (jsonError) {
      console.error('Failed to parse completion details response as JSON:', jsonError);
      completionData = { success: false, message: 'Invalid JSON response' };
    }

    if (!completionResponse.ok) {
      console.error('OptimoRoute get_completion_details error:', completionResponse.status, completionResponseText);
      
      // Continue with the process but flag the completion error
      completionData = {
        success: false,
        error: `API Error (${completionResponse.status}): ${completionResponseText.substring(0, 200)}...`
      };
    }

    // STEP 4: Combine the data
    console.log('Step 3: Combining search results with completion details...');
    
    // Create a map of orderNo to completion details for faster lookups
    const completionMap = new Map();
    
    if (completionData && completionData.success && completionData.orders) {
      completionData.orders.forEach(orderCompletion => {
        if (orderCompletion.orderNo) {
          completionMap.set(orderCompletion.orderNo, orderCompletion);
        }
      });
    }
    
    // Merge search data with completion data
    const currentPageOrders = searchData.orders.map(searchOrder => {
      const orderNo = searchOrder.data?.orderNo;
      const completionInfo = orderNo ? completionMap.get(orderNo) : null;
      
      return {
        ...searchOrder,
        completionDetails: completionInfo || null
      };
    });

    // Combine with previously collected orders if we're paginating
    const combinedOrders = [...allCollectedOrders, ...currentPageOrders];
    console.log(`Successfully combined data: ${currentPageOrders.length} new orders, ${combinedOrders.length} total orders`);
    
    // Handle pagination if enabled and we have more pages
    // Now using after_tag from the API response
    if (enablePagination && searchData.after_tag) {
      const currentPage = allCollectedOrders.length > 0 ? Math.ceil(allCollectedOrders.length / 500) + 1 : 1;
      console.log(`This is page ${currentPage}, more pages available. Returning progress information.`);
      console.log(`API returned after_tag: ${searchData.after_tag}`);
      
      // Prepare pagination progress information
      const paginationProgress = {
        currentPage,
        totalOrdersRetrieved: combinedOrders.length,
        isComplete: false,
        afterTag: searchData.after_tag // Store after_tag in our internal camelCase format
      };
      
      // Prepare response with pagination info
      const response = {
        success: true,
        orders: combinedOrders,
        totalCount: combinedOrders.length,
        after_tag: searchData.after_tag, // Include original after_tag from API
        paginationProgress,
        searchResponse: searchData,
        completionResponse: completionData
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // This is the final page or we're not using pagination
      console.log(`Final page reached or pagination not enabled. Returning complete results.`);
      
      // Prepare final response
      const response = {
        success: true,
        orders: combinedOrders,
        totalCount: combinedOrders.length,
        paginationProgress: {
          currentPage: allCollectedOrders.length > 0 ? Math.ceil(allCollectedOrders.length / 500) + 1 : 1,
          totalOrdersRetrieved: combinedOrders.length,
          isComplete: true
        },
        searchResponse: searchData,
        completionResponse: completionData
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error processing order request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
    );
  }
});
