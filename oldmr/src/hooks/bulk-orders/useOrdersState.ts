
import { useState } from "react";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";

/**
 * Hook to manage the state of bulk orders
 */
export const useOrdersState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BulkOrdersResponse | null>(null);
  const [activeTab, setActiveTab] = useState("with-completion"); // Default to with-completion
  const [rawData, setRawData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  return {
    isLoading,
    setIsLoading,
    response,
    setResponse,
    activeTab,
    setActiveTab,
    rawData,
    setRawData,
    orders,
    setOrders
  };
};
