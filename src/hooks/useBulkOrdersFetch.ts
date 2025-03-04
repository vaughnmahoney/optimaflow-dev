
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
    
    if (!afterTag || (response.paginationProgress && response.paginationProgress.isComplete)) {
      setShouldContinueFetching(false);
      return;
    }

    await fetchOrdersData(afterTag, allCollectedOrders);
  };

  // Function to fetch orders with optional pagination parameters
  const fetchOrdersData = async (afterTag?: string, previousOrders: any[] = []) => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    
    // Only reset response when starting a new fetch (no afterTag)
    if (!afterTag) {
      setResponse(null);
      setAllCollectedOrders([]);
    }

    // Initialize or update response with pagination progress
    if (!afterTag) {
      setResponse({
        paginationProgress: {
          currentPage: 1,
          totalOrdersRetrieved: 0,
          isComplete: false
        }
      });
    }

    // Call the orders API
    const { data, error } = await fetchOrders({
      startDate,
      endDate,
      activeTab,
      afterTag,
      previousOrders
    });

    setIsLoading(false);

    // Handle error case
    if (error || !data) {
      setResponse(handleOrdersError(error || "Unknown error"));
      setShouldContinueFetching(false);
      return;
    }

    // Process the response
    const { updatedResponse, collectedOrders, shouldContinue } = handleOrdersResponse({
      data,
      activeTab,
      previousOrders,
      setShouldContinueFetching
    });

    setResponse(updatedResponse);
    setAllCollectedOrders(collectedOrders);
    setShouldContinueFetching(shouldContinue);
  };

  // Function to start the initial fetch
  const handleFetchOrders = () => {
    setShouldContinueFetching(false); // Reset this flag
    fetchOrdersData(); // Start a fresh fetch without afterTag
  };

  // When shouldContinueFetching changes to true, fetch the next page
  if (shouldContinueFetching && !isLoading) {
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
