
/**
 * Custom hook for handling order deduplication functionality
 */
import { useState, useEffect } from "react";

/**
 * Deduplicates orders based on the orderNo property
 * @param orders Array of orders that may contain duplicates
 * @returns Array of unique orders and deduplication stats
 */
export const deduplicateOrders = (orders: any[]): { 
  uniqueOrders: any[]; 
  stats: { 
    originalCount: number; 
    uniqueCount: number; 
    removedCount: number; 
  } 
} => {
  if (!orders || orders.length === 0) {
    return { 
      uniqueOrders: [], 
      stats: { originalCount: 0, uniqueCount: 0, removedCount: 0 } 
    };
  }
  
  console.log(`Deduplicating ${orders.length} orders...`);
  
  // Use a Map to track unique orders by orderNo
  const uniqueOrders = new Map();
  
  orders.forEach(order => {
    // Find orderNo in different possible locations
    const orderNo = 
      order.data?.orderNo || 
      order.orderNo || 
      order.completionDetails?.orderNo ||
      order.extracted?.orderNo ||
      null;
    
    if (orderNo && !uniqueOrders.has(orderNo)) {
      uniqueOrders.set(orderNo, order);
    }
  });
  
  const result = Array.from(uniqueOrders.values());
  const stats = {
    originalCount: orders.length,
    uniqueCount: result.length,
    removedCount: orders.length - result.length
  };
  
  console.log(`After deduplication: ${result.length} unique orders (removed ${stats.removedCount} duplicates)`);
  
  return { uniqueOrders: result, stats };
};

export const useOrderDeduplication = (orders: any[]) => {
  const [deduplicatedOrders, setDeduplicatedOrders] = useState<any[]>([]);
  const [deduplicationStats, setDeduplicationStats] = useState({
    originalCount: 0,
    uniqueCount: 0,
    removedCount: 0
  });

  useEffect(() => {
    if (orders.length > 0) {
      // Apply deduplication
      const { uniqueOrders, stats } = deduplicateOrders(orders);
      setDeduplicatedOrders(uniqueOrders);
      setDeduplicationStats(stats);
      
      // Log the deduplication results
      console.log(`Original order count: ${stats.originalCount}`);
      console.log(`Deduplicated order count: ${stats.uniqueCount}`);
      console.log(`Removed ${stats.removedCount} duplicate entries`);
    } else {
      setDeduplicatedOrders([]);
      setDeduplicationStats({
        originalCount: 0,
        uniqueCount: 0,
        removedCount: 0
      });
    }
  }, [orders]);

  return {
    deduplicatedOrders,
    deduplicationStats
  };
};
