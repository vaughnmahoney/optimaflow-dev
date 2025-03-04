
import { baseUrl, endpoints } from "../_shared/optimoroute.ts";

// Handle the get_completion_details API call
export async function fetchCompletionDetails(apiKey: string, orderNumbers: { orderNo: string }[]) {
  if (!orderNumbers || orderNumbers.length === 0) {
    console.log('No valid order numbers to fetch completion details');
    return { success: true, data: { orders: [] } };
  }
  
  console.log(`Fetching completion details for ${orderNumbers.length} orders`);
  console.log("First few order numbers:", orderNumbers.slice(0, 5).map(o => o.orderNo));
  
  const requestBody = {
    orders: orderNumbers
  };
  
  console.log("Completion API request body:", JSON.stringify(requestBody, null, 2));
  
  try {
    console.log(`Making request to ${baseUrl}${endpoints.completion}`);
    const response = await fetch(
      `${baseUrl}${endpoints.completion}?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    console.log(`Completion API response status: ${response.status}`);
    
    // Get the raw response for potential error analysis
    const responseText = await response.text();
    console.log(`Completion API raw response length: ${responseText.length} chars`);
    console.log("Completion API raw response sample:", responseText.substring(0, 500) + "...");
    
    let completionData;
    try {
      // Try to parse as JSON
      completionData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Failed to parse completion details response as JSON:', jsonError);
      return { 
        success: false, 
        error: 'Invalid JSON response',
        rawResponse: responseText.substring(0, 200)
      };
    }

    if (!response.ok) {
      console.error('OptimoRoute get_completion_details error:', response.status, responseText);
      
      try {
        // Try to parse error details
        if (typeof completionData === 'object' && completionData !== null) {
          console.error('Error details:', completionData);
        }
      } catch (e) {
        console.error('Error parsing error details');
      }
      
      return {
        success: false,
        error: `API Error (${response.status}): ${responseText.substring(0, 200)}...`,
        data: completionData
      };
    }

    console.log("Completion API success, orders found:", completionData.orders?.length || 0);
    
    if (completionData.orders && completionData.orders.length > 0) {
      console.log("First completion order sample:", JSON.stringify({
        id: completionData.orders[0].id,
        orderNo: completionData.orders[0].orderNo,
        status: completionData.orders[0].status,
        hasData: !!completionData.orders[0].data,
        dataKeys: completionData.orders[0].data ? Object.keys(completionData.orders[0].data) : []
      }, null, 2));
      
      if (completionData.orders[0].data) {
        console.log("First completion order data sample:", JSON.stringify({
          status: completionData.orders[0].data.status,
          hasStartTime: !!completionData.orders[0].data.startTime,
          hasEndTime: !!completionData.orders[0].data.endTime,
          hasTrackingUrl: !!completionData.orders[0].data.tracking_url,
          hasForm: !!completionData.orders[0].data.form,
          formKeys: completionData.orders[0].data.form ? Object.keys(completionData.orders[0].data.form) : []
        }, null, 2));
      }
    }
    
    return { success: true, data: completionData };
  } catch (error) {
    console.error('Error in fetchCompletionDetails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
