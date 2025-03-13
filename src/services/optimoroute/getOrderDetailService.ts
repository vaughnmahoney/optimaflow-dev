
import { supabase } from "@/integrations/supabase/client";

export interface OrderDetail {
  id: string;
  data: {
    orderNo: string;
    date: string;
    notes: string;
    [key: string]: any;
  };
}

export interface OrderDetailsResponse {
  success: boolean;
  error?: string;
  orders?: OrderDetail[];
  orderSummary?: any[]; // Add for debugging
  requestedOrderNumbers?: string[]; // Add for debugging
  parsedError?: any; // Add for debugging
  batchStats?: {
    totalBatches: number;
    completedBatches: number;
    failedBatches: number;
  };
}

// Maximum number of orders per batch (API limit)
const MAX_ORDERS_PER_BATCH = 500;

export const getOrderDetails = async (orderNumbers: string[]): Promise<OrderDetailsResponse> => {
  try {
    if (!orderNumbers.length) {
      return { success: false, error: "No order numbers provided" };
    }
    
    // Enhanced debugging
    console.log(`Fetching details for ${orderNumbers.length} order numbers`);
    console.log("Sample order numbers:", orderNumbers.slice(0, 5));
    
    // Create batches of up to 500 orders each (API limit)
    const batches = [];
    for (let i = 0; i < orderNumbers.length; i += MAX_ORDERS_PER_BATCH) {
      batches.push(orderNumbers.slice(i, i + MAX_ORDERS_PER_BATCH));
    }
    
    console.log(`Split ${orderNumbers.length} orders into ${batches.length} batches`);
    
    // Process the first batch as a test
    // In a future version, we could process all batches sequentially or in parallel
    const firstBatch = batches[0];
    console.log(`Processing first batch with ${firstBatch.length} orders`);
    
    // Call the Supabase Edge Function with just the first batch
    const { data, error } = await supabase.functions.invoke('search-optimoroute', {
      body: {
        orderNumbers: firstBatch
      }
    });
    
    if (error) {
      console.error("Error fetching order details:", error);
      console.error("Error details:", JSON.stringify(error));
      return { 
        success: false, 
        error: error.message,
        batchStats: {
          totalBatches: batches.length,
          completedBatches: 0,
          failedBatches: 1
        }
      };
    }
    
    // Enhanced debugging - log the response structure
    console.log("API response structure:", JSON.stringify({
      success: data?.success,
      hasError: !!data?.error,
      errorMessage: data?.error,
      hasOrders: !!data?.orders,
      ordersCount: data?.orders?.length || 0,
      hasOrderSummary: !!data?.orderSummary,
      summaryCount: data?.orderSummary?.length || 0,
      // Additional debugging info
      responseKeys: data ? Object.keys(data) : [],
      parsedError: data?.parsedError,
      requestedOrderNumbers: data?.requestedOrderNumbers,
    }));
    
    if (!data.success) {
      console.error("API returned error:", data.error);
      return { 
        success: false, 
        error: data.error,
        // Pass through debugging info
        orderSummary: data?.orderSummary,
        requestedOrderNumbers: data?.requestedOrderNumbers,
        parsedError: data?.parsedError,
        batchStats: {
          totalBatches: batches.length,
          completedBatches: 0,
          failedBatches: 1
        }
      };
    }
    
    // Log more details about the received orders
    console.log(`Received details for ${data.orders?.length || 0} orders out of ${firstBatch.length} requested in first batch`);
    
    if (data.orders && data.orders.length > 0) {
      console.log("First order sample:", JSON.stringify({
        id: data.orders[0].id,
        orderNo: data.orders[0].data?.orderNo,
        hasData: !!data.orders[0].data,
        dataKeys: data.orders[0].data ? Object.keys(data.orders[0].data) : []
      }));
    }
    
    // Add batch statistics to the response
    return {
      ...data,
      batchStats: {
        totalBatches: batches.length,
        completedBatches: 1,
        failedBatches: 0
      }
    };
  } catch (error) {
    console.error("Exception in getOrderDetails:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      batchStats: {
        totalBatches: 0,
        completedBatches: 0,
        failedBatches: 1
      }
    };
  }
};
