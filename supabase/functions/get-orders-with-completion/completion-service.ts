
import { baseUrl, endpoints } from "../_shared/optimoroute.ts";

// Handle the get_completion_details API call
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
    console.log(`Making request to ${baseUrl}${endpoints.completion}`);
    const response = await fetch(
      `${baseUrl}${endpoints.completion}?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: orderNumbers
        })
      }
    );
    
    console.log(`Completion API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OptimoRoute get_completion_details error:', response.status, errorText);
      
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error JSON:', errorJson);
      } catch (e) {
        console.error('Error response is not valid JSON');
      }
      
      return {
        success: false,
        error: `OptimoRoute get_completion_details API Error (${response.status}): ${errorText}`,
        status: response.status
      };
    }
    
    // Parse response
    const responseText = await response.text();
    console.log(`Completion API raw response length: ${responseText.length} chars`);
    console.log("Completion API raw response sample:", responseText.substring(0, 500) + "...");
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse completion API response as JSON:", e);
      return {
        success: false,
        error: `Failed to parse completion API response as JSON: ${e.message}`,
        rawResponse: responseText.substring(0, 500)
      };
    }
    
    console.log(`Completion data received for ${data.orders?.length || 0} orders`);
    if (data.orders && data.orders.length > 0) {
      console.log("First completion sample:", JSON.stringify({
        orderNo: data.orders[0].orderNo,
        hasData: !!data.orders[0].data,
        dataKeys: data.orders[0].data ? Object.keys(data.orders[0].data) : [],
        status: data.orders[0].data?.status
      }, null, 2));
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in fetchCompletionDetails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
