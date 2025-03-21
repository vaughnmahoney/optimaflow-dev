
import { useState, useEffect } from "react";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";

interface UsePaginationProps {
  response: BulkOrdersResponse | null;
  isLoading: boolean;
}

/**
 * Manages pagination state and fetching logic
 */
export const useOrdersPagination = ({ 
  response, 
  isLoading 
}: UsePaginationProps) => {
  const [shouldContinueFetching, setShouldContinueFetching] = useState(false);
  const [allCollectedOrders, setAllCollectedOrders] = useState<any[]>([]);

  // Effect to update collected orders when response changes
  useEffect(() => {
    if (response?.orders?.length) {
      const newOrders = response.orders || [];
      if (newOrders.length > 0) {
        setAllCollectedOrders(prev => {
          // Check if these are initial orders or continuation
          if (shouldContinueFetching && prev.length > 0) {
            return [...prev, ...newOrders];
          } else {
            return newOrders;
          }
        });
      }
    }
  }, [response?.orders, shouldContinueFetching]);

  return {
    shouldContinueFetching,
    setShouldContinueFetching,
    allCollectedOrders,
    setAllCollectedOrders
  };
};
