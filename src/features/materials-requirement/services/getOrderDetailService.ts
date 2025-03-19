
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
    successfulBatches: number;
    failedBatches: number;
    totalOrdersProcessed: number;
  };
}

// Maximum number of orders per batch (API limit)
const MAX_ORDERS_PER_BATCH = 500;
// Maximum number of parallel requests to prevent overloading
const MAX_PARALLEL_REQUESTS = 3;

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
    
    // Process all batches in parallel with rate limiting
    let allOrders: OrderDetail[] = [];
    let successfulBatches = 0;
    let failedBatches = 0;
    let totalOrdersProcessed = 0;
    
    // Process batches in groups of MAX_PARALLEL_REQUESTS
    for (let i = 0; i < batches.length; i += MAX_PARALLEL_REQUESTS) {
      const currentBatchGroup = batches.slice(i, i + MAX_PARALLEL_REQUESTS);
      console.log(`Processing batch group ${i / MAX_PARALLEL_REQUESTS + 1}, with ${currentBatchGroup.length} batches`);
      
      const batchPromises = currentBatchGroup.map(async (batch, batchIndex) => {
        const actualBatchIndex = i + batchIndex;
        console.log(`Starting batch ${actualBatchIndex + 1}/${batches.length} with ${batch.length} orders`);
        
        try {
          // Use the new mr-search-orders function instead of search-optimoroute
          const { data, error } = await supabase.functions.invoke('mr-search-orders', {
            body: {
              orderNumbers: batch
            }
          });
          
          if (error) {
            console.error(`Error in batch ${actualBatchIndex + 1}:`, error);
            failedBatches++;
            return { success: false, error: error.message, batchIndex: actualBatchIndex };
          }
          
          if (!data.success || !data.orders?.length) {
            console.error(`API error in batch ${actualBatchIndex + 1}:`, data.error || "No orders returned");
            failedBatches++;
            return { 
              success: false, 
              error: data.error || "No orders returned", 
              batchIndex: actualBatchIndex 
            };
          }
          
          console.log(`Batch ${actualBatchIndex + 1}: Successfully processed ${data.orders.length} orders`);
          successfulBatches++;
          totalOrdersProcessed += data.orders.length;
          return { 
            success: true, 
            orders: data.orders,
            batchIndex: actualBatchIndex 
          };
        } catch (error) {
          console.error(`Exception in batch ${actualBatchIndex + 1}:`, error);
          failedBatches++;
          return { 
            success: false, 
            error: error instanceof Error ? error.message : String(error), 
            batchIndex: actualBatchIndex 
          };
        }
      });
      
      // Wait for the current group of batches to complete before starting the next group
      const batchResults = await Promise.all(batchPromises);
      
      // Collect successful orders
      batchResults.forEach(result => {
        if (result.success && result.orders) {
          allOrders = [...allOrders, ...result.orders];
        }
      });
      
      console.log(`Completed batch group ${i / MAX_PARALLEL_REQUESTS + 1}: ${successfulBatches} successful, ${failedBatches} failed`);
    }
    
    const completedBatches = successfulBatches + failedBatches;
    
    // Return error if no orders were found
    if (allOrders.length === 0) {
      return {
        success: false,
        error: "No order details could be retrieved from any batch",
        batchStats: {
          totalBatches: batches.length,
          completedBatches,
          successfulBatches,
          failedBatches,
          totalOrdersProcessed
        }
      };
    }
    
    // Log the final result
    console.log(`All batches completed. Found ${allOrders.length} orders across ${successfulBatches} successful batches.`);
    
    // Return the accumulated results from all batches
    return {
      success: true,
      orders: allOrders,
      batchStats: {
        totalBatches: batches.length,
        completedBatches,
        successfulBatches,
        failedBatches,
        totalOrdersProcessed
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
        successfulBatches: 0,
        failedBatches: 1,
        totalOrdersProcessed: 0
      }
    };
  }
};
