
import { useState } from "react";
import { toast } from "sonner";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";
import { fetchOrders } from "./bulk-orders/useOrdersApi";
import { handleOrdersResponse, handleOrdersError } from "./bulk-orders/useOrdersResponseHandler";
import { useOrdersPagination } from "./bulk-orders/useOrdersPagination";
import { useOrdersTransformer } from "./bulk-orders/useOrdersTransformer";

export const useBulkOrdersFetch = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BulkOrdersResponse | null>(null);
  const [activeTab, setActiveTab] = useState("search-only");

  // Use our custom hooks for pagination and transformation
  const {
    shouldContinueFetching,
    setShouldContinueFetching,
    allCollectedOrders,
    setAllCollectedOrders
  } = useOrdersPagination({ response, isLoading });

  const { transformedOrders } = useOrdersTransformer(response);

  // Effect to handle continued fetching with pagination
  const fetchNextPage = async () => {
    if (!shouldContinueFetching || !response || isLoading) return;
    
    // Check if we have an after_tag (from API) or afterTag (from pagination progress)
    const afterTag = response.after_tag || response.paginationProgress?.afterTag;
    
    console.log("Fetch next page check:", {
      shouldContinueFetching,
      afterTag,
      isComplete: response.paginationProgress?.isComplete,
      collectedOrdersCount: allCollectedOrders.length
    });
    
    if (!afterTag || (response.paginationProgress && response.paginationProgress.isComplete)) {
      console.log("Stopping pagination: no afterTag or pagination is complete");
      setShouldContinueFetching(false);
      return;
    }

    console.log(`Fetching next page with afterTag: ${afterTag}, collected orders: ${allCollectedOrders.length}`);
    await fetchOrdersData(afterTag, allCollectedOrders);
  };

  // Function to fetch orders with optional pagination parameters
  const fetchOrdersData = async (afterTag?: string, previousOrders: any[] = []) => {
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

    // Initialize or update response with pagination progress
    if (!afterTag) {
      console.log("Initializing response with pagination progress");
      setResponse({
        paginationProgress: {
          currentPage: 1,
          totalOrdersRetrieved: 0,
          isComplete: false
        }
      });
    }

    // Call the orders API
    console.log("Calling fetchOrders API...");
    const { data, error } = await fetchOrders({
      startDate,
      endDate,
      activeTab,
      afterTag,
      previousOrders
    });

    setIsLoading(false);
    console.log("API call completed, isLoading set to false");

    // Handle error case
    if (error || !data) {
      console.error("API call returned error:", error);
      setResponse(handleOrdersError(error || "Unknown error"));
      setShouldContinueFetching(false);
      return;
    }

    console.log("API call successful, data received:", {
      hasOrders: !!data.orders,
      ordersCount: data.orders?.length || 0,
      success: data.success,
      hasAfterTag: !!data.after_tag,
      hasPaginationProgress: !!data.paginationProgress
    });

    // Process the response
    const { updatedResponse, collectedOrders, shouldContinue } = handleOrdersResponse({
      data,
      activeTab,
      previousOrders,
      setShouldContinueFetching
    });

    console.log("Response processed:", {
      updatedOrdersCount: updatedResponse.orders?.length || 0,
      collectedOrdersCount: collectedOrders.length,
      shouldContinueFetching: shouldContinue
    });

    setResponse(updatedResponse);
    setAllCollectedOrders(collectedOrders);
    setShouldContinueFetching(shouldContinue);
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

  // When shouldContinueFetching changes to true, fetch the next page
  if (shouldContinueFetching && !isLoading) {
    console.log("Auto-triggering next page fetch due to shouldContinueFetching flag");
    fetchNextPage();
  }

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    response,
    transformedOrders,
    activeTab,
    setActiveTab,
    shouldContinueFetching,
    handleFetchOrders
  };
};
