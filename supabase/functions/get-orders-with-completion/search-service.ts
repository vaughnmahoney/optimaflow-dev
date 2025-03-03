
import { baseUrl, endpoints } from "../_shared/optimoroute.ts";

// Handle the search_orders API call
export async function fetchSearchOrders(apiKey: string, startDate: string, endDate: string, afterTag?: string) {
  console.log(`Calling search_orders to get orders from ${startDate} to ${endDate}`);
  if (afterTag) {
    console.log(`Including after_tag in request: ${afterTag}`);
  }
  
  // Create the request body according to OptimoRoute API docs
  const requestBody: any = {
    dateRange: {
      from: startDate,
      to: endDate,
    },
    includeOrderData: true,
    includeScheduleInformation: true
  };
  
  // Add afterTag for pagination if provided - using after_tag as per API spec
  if (afterTag) {
    requestBody.after_tag = afterTag;
  }
  
  try {
    const response = await fetch(
      `${baseUrl}${endpoints.search}?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OptimoRoute search_orders error:', response.status, errorText);
      
      return {
        success: false,
        error: `OptimoRoute search_orders API Error (${response.status}): ${errorText}`,
        status: response.status
      };
    }

    // Parse response
    const data = await response.json();
    console.log(`Found ${data.orders?.length || 0} orders on current page`);
    console.log(`After tag present: ${!!data.after_tag}`);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in fetchSearchOrders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
