
import { baseUrl, endpoints } from "../_shared/optimoroute.ts";

// Split array into chunks of specified size
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Process all batches in parallel using Promise.all
async function processBatchesInParallel(
  batches: string[][],
  apiKey: string
): Promise<{
  allOrders: any[];
  batchErrors: string[];
  processedBatchCount: number;
  successfulBatchCount: number;
}> {
  console.log(`Processing ${batches.length} batches in parallel mode`);
  
  const batchPromises = batches.map((batch, index) => 
    processBatch(batch, index, batches.length, apiKey)
  );
  
  const batchResults = await Promise.all(batchPromises);
  
  // Combine results from all batch operations
  let allOrders: any[] = [];
  let batchErrors: string[] = [];
  let processedBatchCount = 0;
  let successfulBatchCount = 0;
  
  batchResults.forEach(result => {
    if (result.orders && result.orders.length > 0) {
      allOrders = [...allOrders, ...result.orders];
      successfulBatchCount++;
    }
    
    if (result.errors && result.errors.length > 0) {
      batchErrors = [...batchErrors, ...result.errors];
    }
    
    processedBatchCount++;
  });
  
  console.log(`Parallel processing complete: ${successfulBatchCount}/${batches.length} batches successful`);
  console.log(`Total orders collected: ${allOrders.length}`);
  
  return {
    allOrders,
    batchErrors,
    processedBatchCount,
    successfulBatchCount
  };
}

// Process a single batch of order numbers
async function processBatch(
  batch: string[],
  batchIndex: number,
  totalBatches: number,
  apiKey: string
): Promise<{
  orders: any[];
  errors: string[];
}> {
  console.log(`Processing batch ${batchIndex+1}/${totalBatches} with ${batch.length} orders`);
  
  try {
    // Build the URL with repeated orderNo query parameters for this batch
    let url = `${baseUrl}${endpoints.completion}?key=${apiKey}`;
    
    // Add each order number from this batch as a separate query parameter
    batch.forEach(orderNo => {
      url += `&orderNo=${encodeURIComponent(orderNo)}`;
    });
    
    // Log the request URL (truncated for readability)
    const truncatedUrl = url.length > 150 ? 
      `${url.substring(0, 150)}...&orderNo=X (truncated, ${batch.length} total parameters)` : 
      url;
    console.log(`Making GET request for batch ${batchIndex+1}: ${truncatedUrl}`);
    
    // Make the GET request for this batch with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`Batch ${batchIndex+1} response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      const batchError = `Batch ${batchIndex+1} error (${response.status}): ${errorText}`;
      console.error(batchError);
      return { orders: [], errors: [batchError] };
    }
    
    // Parse response for this batch
    const responseText = await response.text();
    let batchData;
    
    try {
      batchData = JSON.parse(responseText);
    } catch (e) {
      const parseError = `Failed to parse batch ${batchIndex+1} response as JSON: ${e instanceof Error ? e.message : String(e)}`;
      console.error(parseError);
      return { orders: [], errors: [parseError] };
    }
    
    // If batch was successful, return its orders
    if (batchData.success && Array.isArray(batchData.orders)) {
      console.log(`Batch ${batchIndex+1} returned ${batchData.orders.length} orders successfully`);
      return { orders: batchData.orders, errors: [] };
    } else {
      const batchError = `Batch ${batchIndex+1} returned success: ${batchData.success}, orders count: ${batchData.orders?.length || 0}`;
      console.warn(batchError);
      return { orders: [], errors: [batchError] };
    }
  } catch (error) {
    // Handle any exceptions during batch processing
    const errorMessage = error instanceof Error ? error.message : String(error);
    const batchError = `Exception in batch ${batchIndex+1}: ${errorMessage}`;
    console.error(batchError);
    return { orders: [], errors: [batchError] };
  }
}

// Handle the get_completion_details API call using GET method with batching
export async function fetchCompletionDetails(apiKey: string, orderNumbers: string[]) {
  if (!orderNumbers || orderNumbers.length === 0) {
    console.log("No order numbers provided for completion details");
    return {
      success: false,
      error: "No order numbers provided for completion details"
    };
  }
  
  console.log(`Calling get_completion_details for ${orderNumbers.length} orders`);
  console.log("First few order numbers:", orderNumbers.slice(0, 5));
  
  try {
    // Split order numbers into batches of maximum 500 orders
    const BATCH_SIZE = 500;
    const batches = chunkArray(orderNumbers, BATCH_SIZE);
    console.log(`Split ${orderNumbers.length} orders into ${batches.length} batches of max ${BATCH_SIZE} orders each`);
    
    // Process all batches in parallel for better performance
    const {
      allOrders,
      batchErrors,
      processedBatchCount,
      successfulBatchCount
    } = await processBatchesInParallel(batches, apiKey);
    
    // Log summary of all batches
    console.log(`Completed ${processedBatchCount}/${batches.length} batches, with ${successfulBatchCount} successful`);
    console.log(`Collected ${allOrders.length} orders total from all batches`);
    
    if (batchErrors.length > 0) {
      console.warn(`Encountered ${batchErrors.length} batch errors: ${batchErrors.slice(0, 3).join('; ')}${batchErrors.length > 3 ? '...' : ''}`);
    }
    
    // Return combined results from all batches
    return { 
      success: allOrders.length > 0 || batchErrors.length === 0, 
      data: { 
        orders: allOrders,
        success: true
      },
      errors: batchErrors.length > 0 ? batchErrors : undefined,
      batchStats: {
        totalBatches: batches.length,
        completedBatches: processedBatchCount,
        successfulBatches: successfulBatchCount,
        failedBatches: processedBatchCount - successfulBatchCount,
        totalOrdersProcessed: allOrders.length
      }
    };
    
  } catch (error) {
    console.error('Error in fetchCompletionDetails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
