
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";
import { fetchOrders } from "./bulk-orders/useOrdersApi";

/**
 * Deduplicates orders based on the orderNo property
 * @param orders Array of orders that may contain duplicates
 * @returns Array of unique orders
 */
const deduplicateOrders = (orders: any[]): any[] => {
  if (!orders || orders.length === 0) return [];
  
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
  console.log(`After deduplication: ${result.length} unique orders (removed ${orders.length - result.length} duplicates)`);
  
  return result;
};

export const useBulkOrdersFetch = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BulkOrdersResponse | null>(null);
  const [activeTab, setActiveTab] = useState("with-completion"); // Default to with-completion
  const [shouldContinueFetching, setShouldContinueFetching] = useState(false);
  const [allCollectedOrders, setAllCollectedOrders] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any>(null);
  // Add a state for deduplicated orders
  const [deduplicatedOrders, setDeduplicatedOrders] = useState<any[]>([]);

  // Effect to extract raw data from response for debugging and display
  useEffect(() => {
    if (response && response.orders) {
      setRawData({
        orders: response.orders,
        samples: response.rawDataSamples
      });
      console.log(`Set raw data with ${response.orders.length} orders`);
      
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

  // NEW EFFECT: Add deduplication after all orders are collected
  useEffect(() => {
    if (allCollectedOrders.length > 0) {
      // Apply deduplication
      const uniqueOrders = deduplicateOrders(allCollectedOrders);
      setDeduplicatedOrders(uniqueOrders);
      
      // Log the deduplication results
      console.log(`Original order count: ${allCollectedOrders.length}`);
      console.log(`Deduplicated order count: ${uniqueOrders.length}`);
      console.log(`Removed ${allCollectedOrders.length - uniqueOrders.length} duplicate entries`);
    } else {
      setDeduplicatedOrders([]);
    }
  }, [allCollectedOrders]);

  // Effect to handle continued fetching with pagination
  useEffect(() => {
    const fetchNextPage = async () => {
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
      await fetchOrdersData(afterTag, allCollectedOrders);
    };

    if (shouldContinueFetching && !isLoading) {
      fetchNextPage();
    }
  }, [shouldContinueFetching, response, isLoading, allCollectedOrders]);

  // Function to fetch orders with optional pagination parameters
  const fetchOrdersData = async (afterTag?: string, previousOrders: any[] = []) => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    // Log timezone information for debugging
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("Timezone info:", {
      userTimezone,
      browserOffset: new Date().getTimezoneOffset(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    
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
      setRawData(null);
      setDeduplicatedOrders([]); // Reset deduplicated orders as well
    }

    // Call the orders API - now with only the three required statuses
    console.log("Calling fetchOrders API with filtered status list...");
    const { data, error } = await fetchOrders({
      startDate,
      endDate,
      activeTab,
      afterTag,
      previousOrders,
      validStatuses: ['success', 'failed', 'rejected'] // Only request these three statuses
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
      toast.success(`Retrieved ${data.orders?.length || 0} orders`);
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
    isProcessing: isLoading,
    response,
    rawData,
    rawOrders: deduplicatedOrders, // Use deduplicated orders instead of allCollectedOrders
    originalOrders: allCollectedOrders, // Keep original orders available for debugging
    activeTab,
    setActiveTab,
    shouldContinueFetching,
    handleFetchOrders,
  };
};
