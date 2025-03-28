
import { useState, useCallback } from "react";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";

/**
 * Adapter hook for converting bulk orders data into a consistent format
 * for use with different components and APIs
 */
export const useBulkOrdersAdapter = () => {
  // Track original API response data
  const [originalData, setOriginalData] = useState<{
    response: BulkOrdersResponse | null;
    rawOrders: any[] | null;
  }>({
    response: null,
    rawOrders: null,
  });

  // Track additional processing info
  const [isLoading, setIsLoading] = useState(false);
  const [dataFlowLogging, setDataFlowLogging] = useState<{
    apiRequests: number;
    totalOrdersFromAPI: number | null;
    originalOrderCount: number | null;
    batchStats?: {
      completedBatches: number;
      totalBatches: number;
    };
    [key: string]: any;
  }>({
    apiRequests: 0,
    totalOrdersFromAPI: null,
    originalOrderCount: null,
  });

  // Update logging metrics
  const updateDataFlowMetrics = useCallback((metrics: Record<string, any>) => {
    setDataFlowLogging(prev => ({
      ...prev,
      ...metrics
    }));
  }, []);

  return {
    originalData,
    setOriginalData,
    isLoading,
    setIsLoading,
    dataFlowLogging,
    updateDataFlowMetrics
  };
};
