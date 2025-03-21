
import { useState, useEffect } from "react";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";
import { WorkOrder } from "@/components/workorders/types";
import { transformOrder } from "@/components/bulk-orders/utils/orderTransformer";
import { deduplicateOrders } from "@/components/bulk-orders/utils/deduplicationUtils";

/**
 * Transforms bulk orders API response to WorkOrder format
 */
export const useOrdersTransformer = (response: BulkOrdersResponse | null, activeTab: string) => {
  const [transformedOrders, setTransformedOrders] = useState<WorkOrder[]>([]);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformStats, setTransformStats] = useState({
    inputCount: 0,
    transformedCount: 0,
    uniqueCount: 0,
    elapsedTime: 0
  });

  // Effect to transform orders when response changes
  useEffect(() => {
    if (!response || !response.orders || response.orders.length === 0) {
      setTransformedOrders([]);
      setTransformStats({
        inputCount: 0,
        transformedCount: 0,
        uniqueCount: 0,
        elapsedTime: 0
      });
      return;
    }
    
    // Start transformation process
    setIsTransforming(true);
    const startTime = performance.now();
    
    // Process the transformation asynchronously to avoid blocking UI
    const transformProcess = async () => {
      try {
        console.log(`Starting transformation of ${response.orders.length} orders`);
        
        // Process orders in batches to avoid blocking UI
        const batchSize = 50;
        let transformedBatches: WorkOrder[] = [];
        
        for (let i = 0; i < response.orders.length; i += batchSize) {
          const batch = response.orders.slice(i, i + batchSize);
          
          // Transform each order in this batch
          const transformedBatch = batch.map(order => transformOrder(order));
          transformedBatches = [...transformedBatches, ...transformedBatch];
          
          // Allow UI to update between batches
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        // Deduplicate the transformed orders
        const uniqueOrders = deduplicateOrders(transformedBatches);
        
        // Calculate statistics
        const endTime = performance.now();
        setTransformStats({
          inputCount: response.orders.length,
          transformedCount: transformedBatches.length,
          uniqueCount: uniqueOrders.length,
          elapsedTime: Math.round(endTime - startTime)
        });
        
        console.log(`Transformation complete: ${uniqueOrders.length} unique orders in ${Math.round(endTime - startTime)}ms`);
        
        // Update state with the transformed orders
        setTransformedOrders(uniqueOrders);
      } catch (error) {
        console.error("Error during order transformation:", error);
      } finally {
        setIsTransforming(false);
      }
    };
    
    transformProcess();
  }, [response]);

  return { 
    transformedOrders, 
    isTransforming,
    transformStats
  };
};
