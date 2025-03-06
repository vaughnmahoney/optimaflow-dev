
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
    duplicatedOrderNumbers: string[];
  } 
} => {
  if (!orders || orders.length === 0) {
    return { 
      uniqueOrders: [], 
      stats: { 
        originalCount: 0, 
        uniqueCount: 0, 
        removedCount: 0,
        duplicatedOrderNumbers: []
      } 
    };
  }
  
  console.log(`Deduplicating ${orders.length} orders...`);
  
  // Use a Map to track unique orders by orderNo
  const uniqueOrders = new Map();
  const duplicatedOrderNumbers: string[] = [];
  const duplicateCountByOrderNo: Record<string, number> = {};
  
  orders.forEach(order => {
    // Find orderNo in different possible locations
    const orderNo = 
      order.data?.orderNo || 
      order.orderNo || 
      order.completionDetails?.orderNo ||
      order.extracted?.orderNo ||
      null;
    
    if (orderNo) {
      // Count duplicates
      duplicateCountByOrderNo[orderNo] = (duplicateCountByOrderNo[orderNo] || 0) + 1;
      
      if (uniqueOrders.has(orderNo)) {
        // This is a duplicate - record it
        if (!duplicatedOrderNumbers.includes(orderNo)) {
          duplicatedOrderNumbers.push(orderNo);
        }
      } else {
        uniqueOrders.set(orderNo, order);
      }
    } else {
      console.warn("Order without orderNo found:", order);
    }
  });
  
  // Log duplicate information
  const duplicateStats = duplicatedOrderNumbers.map(orderNo => ({
    orderNo,
    count: duplicateCountByOrderNo[orderNo]
  }));
  
  if (duplicatedOrderNumbers.length > 0) {
    console.log(`Found ${duplicatedOrderNumbers.length} order numbers with duplicates:`);
    console.table(duplicateStats.slice(0, 10)); // Show first 10 duplicates
    
    if (duplicateStats.length > 10) {
      console.log(`... and ${duplicateStats.length - 10} more`);
    }
  }
  
  const result = Array.from(uniqueOrders.values());
  const stats = {
    originalCount: orders.length,
    uniqueCount: result.length,
    removedCount: orders.length - result.length,
    duplicatedOrderNumbers
  };
  
  console.log(`After deduplication: ${result.length} unique orders (removed ${stats.removedCount} duplicates)`);
  
  return { uniqueOrders: result, stats };
};

export const useOrderDeduplication = (orders: any[]) => {
  const [deduplicatedOrders, setDeduplicatedOrders] = useState<any[]>([]);
  const [deduplicationStats, setDeduplicationStats] = useState({
    originalCount: 0,
    uniqueCount: 0,
    removedCount: 0,
    duplicatedOrderNumbers: [] as string[]
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
      
      if (stats.removedCount > 0) {
        console.log(`${(stats.removedCount / stats.originalCount * 100).toFixed(1)}% of orders were duplicates`);
      }
    } else {
      setDeduplicatedOrders([]);
      setDeduplicationStats({
        originalCount: 0,
        uniqueCount: 0,
        removedCount: 0,
        duplicatedOrderNumbers: []
      });
    }
  }, [orders]);

  return {
    deduplicatedOrders,
    deduplicationStats
  };
};
