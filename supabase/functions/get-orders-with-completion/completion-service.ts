
import { baseUrl, endpoints } from "../_shared/optimoroute.ts";

// Split array into chunks of specified size
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
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
    
    // Process each batch and collect all responses
    let allOrders: any[] = [];
    let batchErrors: string[] = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i+1}/${batches.length} with ${batch.length} orders`);
      
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
      console.log(`Making GET request for batch ${i+1}: ${truncatedUrl}`);
      
      // Make the GET request for this batch
      const response = await fetch(url, {
        method: 'GET',
      });
      
      console.log(`Batch ${i+1} response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        const batchError = `Batch ${i+1} error (${response.status}): ${errorText}`;
        console.error(batchError);
        batchErrors.push(batchError);
        continue; // Continue with next batch even if this one failed
      }
      
      // Parse response for this batch
      const responseText = await response.text();
      let batchData;
      
      try {
        batchData = JSON.parse(responseText);
      } catch (e) {
        const parseError = `Failed to parse batch ${i+1} response as JSON: ${e instanceof Error ? e.message : String(e)}`;
        console.error(parseError);
        batchErrors.push(parseError);
        continue; // Continue with next batch
      }
      
      // If batch was successful, add its orders to our collection
      if (batchData.success && Array.isArray(batchData.orders)) {
        console.log(`Batch ${i+1} returned ${batchData.orders.length} orders`);
        allOrders = [...allOrders, ...batchData.orders];
      } else {
        const batchError = `Batch ${i+1} returned success: ${batchData.success}, orders count: ${batchData.orders?.length || 0}`;
        console.warn(batchError);
        batchErrors.push(batchError);
      }
    }
    
    // Log summary of all batches
    console.log(`Completed ${batches.length} batches, collected ${allOrders.length} orders total`);
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
      errors: batchErrors.length > 0 ? batchErrors : undefined
    };
    
  } catch (error) {
    console.error('Error in fetchCompletionDetails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
