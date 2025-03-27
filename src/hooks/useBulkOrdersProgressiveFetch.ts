
import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";
import { useProgressiveLoader, ProgressState } from "./bulk-orders/useProgressiveLoader";
import { useDateRange } from "./bulk-orders/useDateRange";
import { useOrdersState } from "./bulk-orders/useOrdersState";
import { useOrdersLogging } from "./bulk-orders/useOrdersLogging";

export const useBulkOrdersProgressiveFetch = () => {
  // Date range state
  const { startDate, setStartDate, endDate, setEndDate, hasValidDateRange } = useDateRange();
  
  // Orders state management
  const { 
    isLoading: ordersLoading, 
    setIsLoading: setOrdersLoading,
    response, 
    setResponse,
    rawData, 
    setRawData,
    orders, 
    setOrders,
    activeTab,
    setActiveTab
  } = useOrdersState();
  
  // Data flow logging
  const { dataFlowLogging, setDataFlowLogging, updateDataFlowLogging } = useOrdersLogging();

  // Progress state for UI feedback
  const [progressStats, setProgressStats] = useState({
    currentBatch: 0,
    totalBatches: 0,
    successfulBatches: 0,
    failedBatches: 0,
    totalOrdersProcessed: 0
  });

  // Setup the progressive loader
  const {
    state: progressState,
    loadData,
    pause,
    resume,
    reset,
    allData
  } = useProgressiveLoader({
    onProgress: (state: ProgressState) => {
      updateDataFlowLogging({
        apiRequests: state.currentPage,
        totalOrdersFromAPI: state.totalOrders || 0,
        statusFilteredOrders: state.processedOrders,
        originalOrderCount: state.processedOrders,
        batchStats: {
          totalBatches: state.totalPages || 0,
          completedBatches: state.currentPage,
          failedBatches: state.error ? 1 : 0,
          successfulBatches: state.error ? state.currentPage - 1 : state.currentPage,
          totalOrdersProcessed: state.processedOrders
        }
      });

      setProgressStats({
        currentBatch: state.currentPage,
        totalBatches: state.totalPages || 0,
        successfulBatches: state.error ? state.currentPage - 1 : state.currentPage,
        failedBatches: state.error ? 1 : 0,
        totalOrdersProcessed: state.processedOrders
      });
    },
    onComplete: (allData: any[]) => {
      // Set the orders
      setOrders(allData);
      
      // Create a sample of the raw data for debugging
      setRawData({
        orders: allData,
        samples: allData.slice(0, 5),
        batchStats: {
          totalBatches: progressStats.totalBatches,
          completedBatches: progressStats.successfulBatches,
          failedBatches: progressStats.failedBatches,
          totalOrdersProcessed: allData.length
        }
      });
      
      // Update completion state
      setOrdersLoading(false);
      toast.success(`Completed loading ${allData.length} orders`);
    },
    onError: (error: string) => {
      console.error("Order loading error:", error);
      setOrdersLoading(false);
      toast.error(`Error loading orders: ${error}`);
    }
  });

  // Handle starting fetch operation
  const handleFetchOrders = useCallback(() => {
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
    
    // Reset all state
    setOrdersLoading(true);
    setResponse(null);
    setOrders([]);
    setRawData(null);
    
    // Reset data flow logging for new fetch
    setDataFlowLogging({
      apiRequests: 0,
      totalOrdersFromAPI: 0,
      statusFilteredOrders: 0,
      originalOrderCount: 0,
      batchStats: null
    });

    // Format dates properly using UTC timezone to avoid timezone issues
    const formattedStartDate = formatInTimeZone(startDate!, 'UTC', 'yyyy-MM-dd');
    const formattedEndDate = formatInTimeZone(endDate!, 'UTC', 'yyyy-MM-dd');

    // Start progressive loading
    loadData(
      formattedStartDate,
      formattedEndDate,
      ['success', 'failed', 'rejected'] // Only request these three statuses
    );
    
  }, [startDate, endDate, hasValidDateRange, loadData, setOrdersLoading, setResponse, setOrders, setRawData, setDataFlowLogging]);

  // Update isLoading based on progress state
  useEffect(() => {
    setOrdersLoading(progressState.isLoading);
  }, [progressState.isLoading, setOrdersLoading]);

  // Update orders when all data changes
  useEffect(() => {
    if (allData.length > 0) {
      setOrders(allData);
    }
  }, [allData, setOrders]);

  return {
    // Date state
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    
    // Loading state
    isLoading: progressState.isLoading,
    isProcessing: progressState.isLoading,
    
    // Response data
    response,
    rawData,
    rawOrders: orders,
    
    // Tab state
    activeTab,
    setActiveTab,
    
    // Progress state
    progressState,
    progress: progressState.progress,
    
    // Stats and diagnostics
    dataFlowLogging,
    
    // Actions
    handleFetchOrders,
    pauseFetch: pause,
    resumeFetch: resume,
    resetFetch: reset
  };
};
