
import { baseUrl, endpoints } from "../_shared/optimoroute.ts";

// Handle the get_completion_details API call
export async function fetchCompletionDetails(apiKey: string, orderNumbers: { orderNo: string }[]) {
  if (!orderNumbers || orderNumbers.length === 0) {
    console.log('No valid order numbers to fetch completion details');
    return { success: true, data: { orders: [] } };
  }
  
  console.log(`Fetching completion details for ${orderNumbers.length} orders`);
  
  const requestBody = {
    orders: orderNumbers
  };
  
  try {
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

    // Get the raw response for potential error analysis
    const responseText = await response.text();
    
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
      
      return {
        success: false,
        error: `API Error (${response.status}): ${responseText.substring(0, 200)}...`,
        data: completionData
      };
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
