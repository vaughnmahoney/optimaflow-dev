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
    const { orders = [], totalOrders, currentPage, totalPages, continuationToken, isComplete = false } = data;

    // Add new orders to our collection
    setAllData(prev => [...prev, ...orders]);

    // Update progress state
    setProgressState(prev => ({
      ...prev,
      currentPage: currentPage || prev.currentPage + 1,
      totalPages: totalPages || prev.totalPages,
      processedOrders: prev.processedOrders + orders.length,
      totalOrders: totalOrders || prev.totalOrders,
      progress: totalOrders ? ((prev.processedOrders + orders.length) / totalOrders) * 100 : prev.progress,
      continuationToken,
      isComplete,
      error: null
    }));

    // Call progress callback if provided
    if (onProgress) {
      onProgress({
        ...progressState,
        currentPage: currentPage || progressState.currentPage + 1,
        totalPages: totalPages || progressState.totalPages,
        processedOrders: progressState.processedOrders + orders.length,
        totalOrders: totalOrders || progressState.totalOrders,
        progress: totalOrders 
          ? ((progressState.processedOrders + orders.length) / totalOrders) * 100 
          : progressState.progress,
        continuationToken,
        isComplete
      });
    }

    // If complete, call onComplete callback
    if (isComplete) {
      setProgressState(prev => ({ ...prev, isLoading: false, isComplete: true }));
      if (onComplete) onComplete([...allData, ...orders]);
      toast.success(`Completed loading ${progressState.processedOrders + orders.length} orders`);
    } 
    // Otherwise schedule next batch if not paused
    else if (!progressState.isPaused) {
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
    if (!isLoading && !isPaused && !isComplete && !error && continuationToken && lastRequest) {
      const { startDate, endDate, validStatuses } = lastRequest;
      
      // Small delay to prevent rate limiting
      const timeoutId = setTimeout(() => {
        fetchNextBatch(startDate, endDate, validStatuses, continuationToken);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [progressState, lastRequest]);

  return {
    state: progressState,
    loadData,
    pause,
    resume,
    reset,
    allData
  };
};
