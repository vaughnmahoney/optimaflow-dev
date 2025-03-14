
import { useState } from "react";
import { BatchProcessingStats } from "@/components/bulk-orders/types";

/**
 * Interface for data flow logging state
 */
interface DataFlowLogging {
  apiRequests: number;
  totalOrdersFromAPI: number;
  statusFilteredOrders: number;
  originalOrderCount: number;
  batchStats: BatchProcessingStats | null;
}

/**
 * Hook to manage logging information for bulk orders processing
 */
export const useOrdersLogging = () => {
  const [dataFlowLogging, setDataFlowLogging] = useState<DataFlowLogging>({
    apiRequests: 0,
    totalOrdersFromAPI: 0,
    statusFilteredOrders: 0,
    originalOrderCount: 0,
    batchStats: null
  });

  /**
   * Update the data flow logging with new information
   */
  const updateDataFlowLogging = (updates: Partial<DataFlowLogging>) => {
    setDataFlowLogging(prev => ({
      ...prev,
      ...updates
    }));
  };

  return {
    dataFlowLogging,
    setDataFlowLogging,
    updateDataFlowLogging
  };
};
