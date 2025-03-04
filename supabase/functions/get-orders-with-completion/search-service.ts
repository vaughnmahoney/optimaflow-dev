
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
  
  console.log("Search API request body:", JSON.stringify(requestBody, null, 2));
  
  try {
    console.log(`Making request to ${baseUrl}${endpoints.search}`);
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

    console.log(`Search API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OptimoRoute search_orders error:', response.status, errorText);
      
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error JSON:', errorJson);
      } catch (e) {
        console.error('Error response is not valid JSON');
      }
      
      return {
        success: false,
        error: `OptimoRoute search_orders API Error (${response.status}): ${errorText}`,
        status: response.status
      };
    }

    // Parse response
    const responseText = await response.text();
    console.log(`Search API raw response length: ${responseText.length} chars`);
    console.log("Search API raw response sample:", responseText.substring(0, 500) + "...");
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse search API response as JSON:", e);
      return {
        success: false,
        error: `Failed to parse search API response as JSON: ${e.message}`,
        rawResponse: responseText.substring(0, 500)
      };
    }
    
    console.log(`Found ${data.orders?.length || 0} orders on current page`);
    console.log(`After tag present: ${!!data.after_tag}`);
    
    if (data.orders && data.orders.length > 0) {
      // Log more detailed order structure for debugging
      console.log("First order sample:", JSON.stringify({
        id: data.orders[0].id,
        orderNo: data.orders[0].data?.orderNo,
        date: data.orders[0].data?.date,
        hasDriver: !!data.orders[0].scheduleInformation?.driverName,
        hasLocation: !!data.orders[0].data?.location,
        dataKeys: data.orders[0].data ? Object.keys(data.orders[0].data) : [],
        scheduleKeys: data.orders[0].scheduleInformation ? Object.keys(data.orders[0].scheduleInformation) : []
      }, null, 2));
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in fetchSearchOrders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
