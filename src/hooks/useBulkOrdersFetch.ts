
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BulkOrdersResponse, BatchProcessingStats } from "@/components/bulk-orders/types";
import { fetchOrders } from "./bulk-orders/useOrdersApi";
import { useDateRange } from "./bulk-orders/useDateRange";

export const useBulkOrdersFetch = () => {
  // Date range state
  const { startDate, setStartDate, endDate, setEndDate, hasValidDateRange } = useDateRange();
  
  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BulkOrdersResponse | null>(null);
  const [activeTab, setActiveTab] = useState("with-completion"); // Default to with-completion
  const [rawData, setRawData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Add data flow logging state with batch stats
  const [dataFlowLogging, setDataFlowLogging] = useState({
    apiRequests: 0,
    totalOrdersFromAPI: 0,
    statusFilteredOrders: 0,
    batchStats: null as BatchProcessingStats | null
  });

  // Handle order fetch
  const fetchOrdersData = async () => {
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
      activeTab
    });
    
    setIsLoading(true);
    setResponse(null);
    setOrders([]);
    setRawData(null);
    
    // Reset data flow logging for new fetch
    setDataFlowLogging({
      apiRequests: 1, // Count this request
      totalOrdersFromAPI: 0,
      statusFilteredOrders: 0,
      batchStats: null
    });

    // Call the orders API - with only the three required statuses
    console.log("Calling fetchOrders API with filtered status list...");
    const { data, error } = await fetchOrders({
      startDate: startDate!,
      endDate: endDate!,
      activeTab,
      validStatuses: ['success', 'failed', 'rejected'] // Only request these three statuses
    });

    setIsLoading(false);
    console.log("API call completed, isLoading set to false");

    // Handle error case
    if (error || !data) {
      console.error("API call returned error:", error);
      toast.error(`Error: ${error || "Unknown error"}`);
      return;
    }
    
    // Update data flow logging with API response data and batch stats
    setDataFlowLogging(prev => ({
      ...prev,
      totalOrdersFromAPI: data.filteringMetadata?.unfilteredOrderCount || 0,
      statusFilteredOrders: data.filteringMetadata?.filteredOrderCount || 0,
      batchStats: data.batchStats || null
    }));

    // Update response
    setResponse(data);
    
    // Set orders
    if (data && data.orders) {
      setOrders(data.orders);
      
      // Log status distribution
      const statusCounts: Record<string, number> = {};
      data.orders.forEach(order => {
        const status = order.completion_status || 
                     order.completionDetails?.data?.status || 
                     order.extracted?.completionStatus || 
                     "unknown";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      console.log("Status distribution in orders:", statusCounts);
    }
    
    // Extract raw data for debugging
    if (data && data.orders) {
      setRawData({
        orders: data.orders,
        samples: data.rawDataSamples,
        batchStats: data.batchStats
      });
    }
    
    // Display success message
    toast.success(`Retrieved ${data.orders?.length || 0} orders`);
  };

  // Function to start the fetch
  const handleFetchOrders = () => {
    console.log("Starting new fetch with dates:", {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      activeTab
    });
    fetchOrdersData();
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
    rawOrders: orders,
    
    // Tab state
    activeTab,
    setActiveTab,
    
    // Stats and diagnostics
    dataFlowLogging,
    
    // Actions
    handleFetchOrders,
  };
};
