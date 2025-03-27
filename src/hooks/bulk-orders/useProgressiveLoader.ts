
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ProgressState {
  isLoading: boolean;
  currentPage: number;
  totalPages: number | null;
  processedOrders: number;
  totalOrders: number | null;
  progress: number;
  error: string | null;
  continuationToken: string | null;
  isComplete: boolean;
  isPaused: boolean;
}

export interface ProgressiveLoaderOptions {
  batchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
  onProgress?: (state: ProgressState) => void;
  onComplete?: (allData: any[]) => void;
  onError?: (error: string) => void;
}

/**
 * Hook to manage progressive loading of bulk orders
 */
export const useProgressiveLoader = (options: ProgressiveLoaderOptions = {}) => {
  const {
    batchSize = 500,
    maxRetries = 3,
    retryDelay = 2000,
    onProgress,
    onComplete,
    onError
  } = options;

  const [progressState, setProgressState] = useState<ProgressState>({
    isLoading: false,
    currentPage: 0,
    totalPages: null,
    processedOrders: 0,
    totalOrders: null,
    progress: 0,
    error: null,
    continuationToken: null,
    isComplete: false,
    isPaused: false
  });

  const [allData, setAllData] = useState<any[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRequest, setLastRequest] = useState<{
    startDate: string;
    endDate: string;
    validStatuses: string[];
  } | null>(null);
  
  // Track whether all pages have been processed
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);
  
  // Add a flag to track when we're processing the final batch
  const [processingFinalBatch, setProcessingFinalBatch] = useState(false);

  const reset = () => {
    setProgressState({
      isLoading: false,
      currentPage: 0,
      totalPages: null,
      processedOrders: 0,
      totalOrders: null,
      progress: 0,
      error: null,
      continuationToken: null,
      isComplete: false,
      isPaused: false
    });
    setAllData([]);
    setRetryCount(0);
    setLastRequest(null);
    setHasMorePages(true);
    setProcessingFinalBatch(false);
  };

  // Function to pause loading
  const pause = () => {
    if (progressState.isLoading && !progressState.isComplete) {
      setProgressState(prev => ({ ...prev, isPaused: true, isLoading: false }));
      toast.info("Order loading paused. You can resume later.");
    }
  };

  // Function to resume loading
  const resume = () => {
    if (progressState.isPaused && lastRequest) {
      setProgressState(prev => ({ ...prev, isPaused: false, isLoading: true }));
      // The loading will continue on the next useEffect cycle
      toast.info("Resuming order loading...");
    }
  };

  // Main function to start loading data progressively
  const loadData = useCallback(async (
    startDate: string,
    endDate: string,
    validStatuses: string[] = ['success', 'failed', 'rejected']
  ) => {
    // Don't start if already loading or if no dates provided
    if (progressState.isLoading || !startDate || !endDate) return;

    // Reset state if this is a new request
    if (!progressState.isPaused) {
      reset();
    }

    // Save this request for potential resume
    setLastRequest({ startDate, endDate, validStatuses });

    // Update loading state
    setProgressState(prev => ({
      ...prev,
      isLoading: true,
      isPaused: false,
      error: null
    }));

    try {
      // Make first request with no continuation token
      await fetchNextBatch(startDate, endDate, validStatuses, progressState.continuationToken);
    } catch (error) {
      handleError(error);
    }
  }, [progressState.isLoading, progressState.isPaused, progressState.continuationToken]);

  // Function to fetch the next batch of data
  const fetchNextBatch = async (
    startDate: string,
    endDate: string,
    validStatuses: string[],
    continuationToken: string | null = null
  ) => {
    try {
      setProgressState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      console.log(`Fetching batch with continuation token: ${continuationToken || 'INITIAL'}`);
      
      const { data, error } = await supabase.functions.invoke('get-orders-with-completion', {
        body: {
          startDate,
          endDate,
          validStatuses,
          batchSize,
          continuationToken
        }
      });

      if (error) throw new Error(error.message);
      if (!data) throw new Error("No data returned from API");

      // Handle the API response
      handleBatchResponse(data, startDate, endDate, validStatuses);
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (error) {
      handleBatchError(error, startDate, endDate, validStatuses);
    }
  };

  // Handle successful batch response
  const handleBatchResponse = (
    data: any,
    startDate: string,
    endDate: string,
    validStatuses: string[]
  ) => {
    const { 
      orders = [], 
      totalOrders, 
      currentPage, 
      totalPages, 
      continuationToken, 
      isComplete = false,
      filteringMetadata 
    } = data;

    console.log("Batch response metadata:", {
      ordersInBatch: orders.length,
      continuationToken: continuationToken ? "Present" : "None",
      isComplete,
      currentPage,
      totalPages
    });

    // Determine if there are more pages to fetch
    // Only mark as no more pages if we have an explicit indication (no token AND isComplete flag)
    if (!continuationToken && isComplete) {
      setHasMorePages(false);
      console.log("No more pages to fetch - confirmed by API");
      
      // Mark that we're processing the final batch
      setProcessingFinalBatch(true);
    }

    // Add new orders to our collection
    setAllData(prev => {
      const combined = [...prev, ...orders];
      console.log(`Combined ${prev.length} existing orders with ${orders.length} new orders = ${combined.length} total`);
      return combined;
    });

    // Update total orders count if provided
    const estimatedTotalOrders = totalOrders || 
      (filteringMetadata?.unfilteredOrderCount ? filteringMetadata.unfilteredOrderCount : null);

    // Calculate progress - ensure we don't exceed 100%
    const newProcessedOrders = allData.length + orders.length;
    const newTotalOrders = estimatedTotalOrders || newProcessedOrders;
    const newProgress = newTotalOrders > 0 ? 
      Math.min((newProcessedOrders / newTotalOrders) * 100, 100) : 0;

    // Update progress state
    setProgressState(prev => ({
      ...prev,
      currentPage: currentPage || prev.currentPage + 1,
      totalPages: totalPages || prev.totalPages,
      processedOrders: newProcessedOrders,
      totalOrders: newTotalOrders,
      progress: newProgress,
      continuationToken,
      // Only mark as complete if we've confirmed there are no more pages
      isComplete: !hasMorePages && processingFinalBatch
    }));

    // Call progress callback if provided
    if (onProgress) {
      onProgress({
        ...progressState,
        currentPage: currentPage || progressState.currentPage + 1,
        totalPages: totalPages || progressState.totalPages,
        processedOrders: newProcessedOrders,
        totalOrders: newTotalOrders,
        progress: newProgress,
        continuationToken,
        isComplete: !hasMorePages && processingFinalBatch
      });
    }

    // If no more pages and this is the final batch, we need to mark complete
    // and call onComplete with a slight delay to ensure all data is processed
    if (!hasMorePages && processingFinalBatch) {
      // Use setTimeout to ensure state updates have propagated
      setTimeout(() => {
        // Mark as complete and stop loading
        setProgressState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isComplete: true,
          progress: 100 // Ensure we show 100% when complete
        }));
        
        // Call onComplete with all collected data
        if (onComplete) {
          const finalData = [...allData, ...orders];
          console.log(`Calling onComplete with ${finalData.length} total orders`);
          onComplete(finalData);
        }
        
        toast.success(`Completed loading ${newProcessedOrders} orders`);
      }, 500);
    } 
    // Otherwise schedule next batch if not paused
    else if (!progressState.isPaused && continuationToken) {
      setTimeout(() => {
        fetchNextBatch(startDate, endDate, validStatuses, continuationToken);
      }, 300); // Small delay to prevent rate limiting
    }
  };

  // Handle batch error with retry logic
  const handleBatchError = (
    error: any,
    startDate: string,
    endDate: string,
    validStatuses: string[]
  ) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching batch:", errorMessage);

    // Increment retry count
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);

    // If we haven't exceeded max retries, try again with backoff
    if (newRetryCount <= maxRetries) {
      const backoffMs = retryDelay * Math.pow(2, newRetryCount - 1);
      console.log(`Retrying in ${backoffMs}ms (attempt ${newRetryCount}/${maxRetries})`);
      
      setProgressState(prev => ({
        ...prev,
        error: `Retry ${newRetryCount}/${maxRetries}: ${errorMessage}`
      }));

      // Schedule retry with exponential backoff
      setTimeout(() => {
        fetchNextBatch(startDate, endDate, validStatuses, progressState.continuationToken);
      }, backoffMs);
    } else {
      // Max retries exceeded, set error state
      handleError(error);
    }
  };

  // Handle general errors
  const handleError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Progressive loader error:", errorMessage);
    
    setProgressState(prev => ({ 
      ...prev, 
      isLoading: false, 
      error: errorMessage 
    }));
    
    if (onError) onError(errorMessage);
    toast.error(`Error: ${errorMessage}`);
  };

  // Update effect to handle auto-continue loading after state changes
  useEffect(() => {
    const { isLoading, isPaused, isComplete, error, continuationToken } = progressState;
    
    // If we were loading, not paused or complete, have a continuation token and no error, continue loading
    if (!isLoading && !isPaused && !isComplete && !error && continuationToken && lastRequest && hasMorePages) {
      const { startDate, endDate, validStatuses } = lastRequest;
      
      // Small delay to prevent rate limiting
      const timeoutId = setTimeout(() => {
        console.log("Auto-continuing to next batch with token:", continuationToken ? "Present" : "None");
        fetchNextBatch(startDate, endDate, validStatuses, continuationToken);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [progressState, lastRequest, hasMorePages]);

  // Fix for getting stuck on last batch - ensure we properly complete if we have no more pages
  useEffect(() => {
    if (!hasMorePages && processingFinalBatch && progressState.isLoading) {
      // If we're processing the final batch and the loader is still running,
      // ensure we properly finish the loading process
      setTimeout(() => {
        console.log("Finalizing last batch processing...");
        setProgressState(prev => ({
          ...prev,
          isLoading: false,
          isComplete: true,
          progress: 100
        }));
        
        // Notify that loading is complete
        if (onComplete) {
          console.log(`Finalizing with ${allData.length} total orders`);
          onComplete(allData);
        }
      }, 1000);
    }
  }, [hasMorePages, processingFinalBatch, progressState.isLoading, allData, onComplete]);

  return {
    state: progressState,
    loadData,
    pause,
    resume,
    reset,
    allData
  };
};
