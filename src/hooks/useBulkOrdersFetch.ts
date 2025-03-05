
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";
import { fetchOrders } from "./bulk-orders/useOrdersApi";
import { useOrdersTransformer } from "./bulk-orders/useOrdersTransformer";
import { WorkOrder } from "@/components/workorders/types";
import { mergeOrders } from "@/components/bulk-orders/utils/deduplicationUtils";

export const useBulkOrdersFetch = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BulkOrdersResponse | null>(null);
  const [activeTab, setActiveTab] = useState("search-only");
  const [shouldContinueFetching, setShouldContinueFetching] = useState(false);
  const [allCollectedOrders, setAllCollectedOrders] = useState<WorkOrder[]>([]);

  // Use our transformer hook
  const { 
    transformedOrders, 
    isTransforming,
    transformStats 
  } = useOrdersTransformer(response, activeTab);

  // Effect to merge new transformed orders with previously collected ones
  useEffect(() => {
    if (transformedOrders.length > 0 && shouldContinueFetching) {
      // Merge with previously collected orders
      const merged = mergeOrders(allCollectedOrders, transformedOrders);
      console.log(`Merged ${allCollectedOrders.length} existing + ${transformedOrders.length} new = ${merged.length} total orders`);
      setAllCollectedOrders(merged);
    } else if (transformedOrders.length > 0 && !shouldContinueFetching) {
      // For initial fetch or when pagination is complete
      console.log(`Setting ${transformedOrders.length} transformed orders as all collected orders (non-paginating)`);
      setAllCollectedOrders(transformedOrders);
    }
  }, [transformedOrders, shouldContinueFetching]);

  // Effect to handle continued fetching with pagination
  useEffect(() => {
    const fetchNextPage = async () => {
      if (!shouldContinueFetching || !response || isLoading || isTransforming) return;
      
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
      await fetchOrdersData(afterTag, allCollectedOrders);
    };

    if (shouldContinueFetching && !isLoading && !isTransforming) {
      fetchNextPage();
    }
  }, [shouldContinueFetching, response, isLoading, isTransforming, allCollectedOrders]);

  // Function to fetch orders with optional pagination parameters
  const fetchOrdersData = async (afterTag?: string, previousOrders: WorkOrder[] = []) => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    console.log("Fetch orders data:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      activeTab,
      afterTag: afterTag || "none",
      previousOrdersCount: previousOrders.length
    });
    
    setIsLoading(true);
    
    // Only reset response when starting a new fetch (no afterTag)
    if (!afterTag) {
      console.log("Starting new fetch, resetting response and collected orders");
      setResponse(null);
      setAllCollectedOrders([]);
    }

    // Call the orders API
    console.log("Calling fetchOrders API...");
    const { data, error } = await fetchOrders({
      startDate,
      endDate,
      activeTab,
      afterTag,
      previousOrders,
      validStatuses: ['success', 'failed', 'rejected'] // These statuses match our requirements
    });

    setIsLoading(false);
    console.log("API call completed, isLoading set to false");

    // Handle error case
    if (error || !data) {
      console.error("API call returned error:", error);
      toast.error(`Error: ${error || "Unknown error"}`);
      setShouldContinueFetching(false);
      return;
    }

    // Update response and check if we need to continue fetching
    setResponse(data);
    
    // Check if there are more pages to fetch
    const hasMorePages = !!(data.after_tag || 
                       (data.paginationProgress && data.paginationProgress.isComplete === false));
    
    console.log(`Setting shouldContinueFetching to: ${hasMorePages} based on API response`);
    setShouldContinueFetching(hasMorePages);
    
    // Display success message if this is the last page
    if (!hasMorePages) {
      if (activeTab === "with-completion") {
        const filteredCount = data.filteredCount || 0;
        const totalCount = data.totalCount || 0;
        toast.success(`Retrieved ${filteredCount} completed orders out of ${totalCount} total orders`);
      } else {
        toast.success(`Retrieved ${data.totalCount || 0} orders`);
      }
    }
  };

  // Function to start the initial fetch
  const handleFetchOrders = () => {
    console.log("Starting new fetch with dates:", {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      activeTab
    });
    setShouldContinueFetching(false); // Reset this flag
    fetchOrdersData(); // Start a fresh fetch without afterTag
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    isProcessing: isLoading || isTransforming,
    response,
    transformedOrders: allCollectedOrders,
    activeTab,
    setActiveTab,
    shouldContinueFetching,
    handleFetchOrders,
    transformStats
  };
};
