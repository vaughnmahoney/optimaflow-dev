
/**
 * Custom hook for handling order pagination
 */
import { useState, useEffect } from "react";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";

export const useOrderPagination = (
  response: BulkOrdersResponse | null,
  isLoading: boolean,
  fetchNextPage: (afterTag: string, previousOrders: any[]) => Promise<void>
) => {
  const [shouldContinueFetching, setShouldContinueFetching] = useState(false);
  const [allCollectedOrders, setAllCollectedOrders] = useState<any[]>([]);

  // Effect to extract orders from response
  useEffect(() => {
    if (response && response.orders) {
      console.log(`Got response with ${response.orders.length} orders`);
      
      // Append to collected orders if paginating
      if (shouldContinueFetching) {
        setAllCollectedOrders(prev => {
          const combined = [...prev, ...response.orders];
          console.log(`Combined ${prev.length} existing orders with ${response.orders.length} new orders = ${combined.length} total`);
          return combined;
        });
      } else {
        // For initial fetch or when pagination is complete, just set directly
        setAllCollectedOrders(response.orders);
      }
    }
  }, [response, shouldContinueFetching]);

  // Effect to handle continued fetching with pagination
  useEffect(() => {
    const continueWithPagination = async () => {
      if (!shouldContinueFetching || !response || isLoading) return;
      
      // Check if we have an after_tag (from API) or afterTag (from pagination progress)
      const afterTag = response.after_tag || (response.paginationProgress?.afterTag ?? undefined);
      
      console.log("Fetch next page check:", {
        shouldContinueFetching,
        afterTag,
        isComplete: response.paginationProgress?.isComplete,
        collectedOrdersCount: allCollectedOrders.length
      });
      
      if (!afterTag || (response.paginationProgress && response.paginationProgress.isComplete === true)) {
        console.log("Stopping pagination: no afterTag or pagination is complete");
        setShouldContinueFetching(false);
        return;
      }

      console.log(`Fetching next page with afterTag: ${afterTag}, collected orders: ${allCollectedOrders.length}`);
      await fetchNextPage(afterTag, allCollectedOrders);
    };

    if (shouldContinueFetching && !isLoading) {
      continueWithPagination();
    }
  }, [shouldContinueFetching, response, isLoading, allCollectedOrders, fetchNextPage]);

  return {
    shouldContinueFetching,
    setShouldContinueFetching,
    allCollectedOrders,
    setAllCollectedOrders
  };
};
