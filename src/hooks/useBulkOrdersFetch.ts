
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";
import { fetchOrders } from "./bulk-orders/useOrdersApi";
import { useDateRange } from "./bulk-orders/useDateRange";
import { useOrderPagination } from "./bulk-orders/useOrderPagination";
import { useOrderDeduplication } from "./bulk-orders/useOrderDeduplication";

export const useBulkOrdersFetch = () => {
  // Date range state
  const { startDate, setStartDate, endDate, setEndDate, hasValidDateRange } = useDateRange();
  
  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BulkOrdersResponse | null>(null);
  const [activeTab, setActiveTab] = useState("with-completion"); // Default to with-completion
  const [rawData, setRawData] = useState<any>(null);
  
  // Add data flow logging state
  const [dataFlowLogging, setDataFlowLogging] = useState({
    apiRequests: 0,
    totalOrdersFromAPI: 0,
    statusFilteredOrders: 0,
    finalDeduplicatedOrders: 0
  });

  // Handle order pagination
  const fetchOrdersData = async (afterTag?: string, previousOrders: any[] = []) => {
    if (!hasValidDateRange) {
      toast.error("Please select both start and end dates");
      return;
    }

    // Log timezone information for debugging
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("Timezone info:", {
      userTimezone,
      browserOffset: new Date().getTimezoneOffset(),
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });
    
    console.log("Fetch orders data:", {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      activeTab,
      afterTag: afterTag || "none",
      previousOrdersCount: previousOrders.length
    });
    
    setIsLoading(true);
    
    // Track API request count
    setDataFlowLogging(prev => ({
      ...prev,
      apiRequests: prev.apiRequests + 1
    }));
    
    // Only reset response when starting a new fetch (no afterTag)
    if (!afterTag) {
      console.log("Starting new fetch, resetting response and collected orders");
      setResponse(null);
      setAllCollectedOrders([]);
      setRawData(null);
      
      // Reset data flow logging for new fetch
      setDataFlowLogging({
        apiRequests: 1, // Count this request
        totalOrdersFromAPI: 0,
        statusFilteredOrders: 0,
        finalDeduplicatedOrders: 0
      });
    }

    // Call the orders API - now with only the three required statuses
    console.log("Calling fetchOrders API with filtered status list...");
    const { data, error } = await fetchOrders({
      startDate: startDate!,
      endDate: endDate!,
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
    
    // Update data flow logging with API response data
    if (data.filteringMetadata) {
      setDataFlowLogging(prev => ({
        ...prev,
        totalOrdersFromAPI: prev.totalOrdersFromAPI + (data.filteringMetadata?.unfilteredOrderCount || 0),
        statusFilteredOrders: prev.statusFilteredOrders + (data.filteringMetadata?.filteredOrderCount || 0)
      }));
    }

    // Update response and check if we need to continue fetching
    setResponse(data);
    
    // Extract raw data for debugging
    if (data && data.orders) {
      setRawData({
        orders: data.orders,
        samples: data.rawDataSamples
      });
    }
    
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

  // Pagination state management
  const { 
    shouldContinueFetching, 
    setShouldContinueFetching, 
    allCollectedOrders, 
    setAllCollectedOrders,
    paginationStats
  } = useOrderPagination(response, isLoading, fetchOrdersData);

  // Deduplication
  const { deduplicatedOrders, deduplicationStats } = useOrderDeduplication(allCollectedOrders);
  
  // Update data flow logging when deduplicated orders change
  useEffect(() => {
    if (deduplicatedOrders.length > 0) {
      setDataFlowLogging(prev => ({
        ...prev,
        finalDeduplicatedOrders: deduplicatedOrders.length
      }));
    }
  }, [deduplicatedOrders.length]);

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
    // Date state
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    
    // Loading state
    isLoading,
    isProcessing: isLoading,
    
    // Response data
    response,
    rawData,
    rawOrders: deduplicatedOrders, // Use deduplicated orders
    originalOrders: allCollectedOrders, // Keep original orders available for debugging
    
    // Tab state
    activeTab,
    setActiveTab,
    
    // Pagination state
    shouldContinueFetching,
    
    // Stats and diagnostics - expose these properties
    paginationStats,
    deduplicationStats,
    dataFlowLogging,
    
    // Actions
    handleFetchOrders,
  };
};
