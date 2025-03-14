
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
  const [paginationStats, setPaginationStats] = useState({
    pagesRetrieved: 0,
    totalOrdersBeforeFiltering: 0
  });

  // Effect to extract orders from response
  useEffect(() => {
    if (response && response.orders) {
      console.log(`Got response with ${response.orders.length} orders (page ${paginationStats.pagesRetrieved + 1})`);
      
      // Track total orders from API (before our filtering)
      setPaginationStats(prev => ({
        pagesRetrieved: prev.pagesRetrieved + 1,
        totalOrdersBeforeFiltering: prev.totalOrdersBeforeFiltering + 
          (response.filteringMetadata?.unfilteredOrderCount || response.orders.length)
      }));
      
      // Append to collected orders if paginating
      if (shouldContinueFetching) {
        setAllCollectedOrders(prev => {
          const combined = [...prev, ...response.orders];
          console.log(`Combined ${prev.length} existing orders with ${response.orders.length} new orders = ${combined.length} total`);
          
          // Log status distribution to see what we're getting
          const statusCounts: Record<string, number> = {};
          combined.forEach(order => {
            const status = order.completion_status || 
                         order.completionDetails?.data?.status || 
                         order.extracted?.completionStatus || 
                         "unknown";
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });
          console.log("Status distribution in combined orders:", statusCounts);
          
          return combined;
        });
      } else {
        // For initial fetch or when pagination is complete, just set directly
        setAllCollectedOrders(response.orders);
        
        // Log status distribution for initial fetch
        const statusCounts: Record<string, number> = {};
        response.orders.forEach(order => {
          const status = order.completion_status || 
                       order.completionDetails?.data?.status || 
                       order.extracted?.completionStatus || 
                       "unknown";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        console.log("Status distribution in initial orders:", statusCounts);
      }
    }
  }, [response, shouldContinueFetching, paginationStats.pagesRetrieved]);

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
        collectedOrdersCount: allCollectedOrders.length,
        estimatedTotalPages: Math.ceil((response.totalCount || 0) / 500),
        currentPage: paginationStats.pagesRetrieved
      });
      
      if (!afterTag || (response.paginationProgress && response.paginationProgress.isComplete === true)) {
        console.log("Stopping pagination: no afterTag or pagination is complete");
        setShouldContinueFetching(false);
        
        // Final pagination summary
        console.log("Pagination complete. Summary:", {
          pagesRetrieved: paginationStats.pagesRetrieved,
          totalOrdersCollected: allCollectedOrders.length,
          unfilteredOrdersFromAPI: paginationStats.totalOrdersBeforeFiltering
        });
        return;
      }

      console.log(`Fetching next page with afterTag: ${afterTag}, collected orders: ${allCollectedOrders.length}`);
      await fetchNextPage(afterTag, allCollectedOrders);
    };

    if (shouldContinueFetching && !isLoading) {
      continueWithPagination();
    }
  }, [shouldContinueFetching, response, isLoading, allCollectedOrders, fetchNextPage, paginationStats.pagesRetrieved]);

  return {
    shouldContinueFetching,
    setShouldContinueFetching,
    allCollectedOrders,
    setAllCollectedOrders,
    paginationStats
  };
};
