
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";
import { WorkOrder } from "@/components/workorders/types";
import { transformBulkOrderToWorkOrder } from "@/components/bulk-orders/utils/transformBulkOrderData";

export const useBulkOrdersFetch = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BulkOrdersResponse | null>(null);
  const [activeTab, setActiveTab] = useState("search-only");
  const [shouldContinueFetching, setShouldContinueFetching] = useState(false);
  const [allCollectedOrders, setAllCollectedOrders] = useState<any[]>([]);
  const [transformedOrders, setTransformedOrders] = useState<WorkOrder[]>([]);

  // Effect to handle continued fetching with pagination
  useEffect(() => {
    const fetchNextPage = async () => {
      if (!shouldContinueFetching || !response) return;
      
      // Check if we have an after_tag (from API) or afterTag (from pagination progress)
      const afterTag = response.after_tag || response.paginationProgress?.afterTag;
      
      if (!afterTag || (response.paginationProgress && response.paginationProgress.isComplete)) {
        setShouldContinueFetching(false);
        return;
      }

      await fetchOrders(afterTag, allCollectedOrders);
    };

    if (shouldContinueFetching && !isLoading) {
      fetchNextPage();
    }
  }, [shouldContinueFetching, response, isLoading, allCollectedOrders]);

  // Effect to transform orders when response changes
  useEffect(() => {
    if (response && response.orders && response.orders.length > 0) {
      const workOrders = response.orders.map(transformBulkOrderToWorkOrder);
      setTransformedOrders(workOrders);
    } else {
      setTransformedOrders([]);
    }
  }, [response]);

  const fetchOrders = async (afterTag?: string, previousOrders: any[] = []) => {
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

    try {
      // Format dates as ISO strings
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      let endpoint;
      let logMessage;
      
      if (activeTab === "search-only") {
        endpoint = "bulk-get-orders";
        logMessage = "Calling bulk-get-orders (search_orders only)";
      } else {
        endpoint = "get-orders-with-completion";
        logMessage = "Calling get-orders-with-completion (search_orders + get_completion_details)";
      }
      
      console.log(`${logMessage} with dates: ${formattedStartDate} to ${formattedEndDate}`);
      
      if (afterTag) {
        console.log(`Continuing with afterTag/after_tag: ${afterTag}`);
        console.log(`Previously collected orders: ${previousOrders.length}`);
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

      // Call the selected edge function with pagination support
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          enablePagination: true,
          afterTag: afterTag,  // We'll pass the tag in the same format we received it
          allCollectedOrders: previousOrders
        }
      });

      if (error) {
        console.error(`Error fetching orders:`, error);
        toast.error(`Error: ${error.message}`);
        setResponse({ error: error.message });
        setShouldContinueFetching(false);
      } else {
        console.log("API response:", data);
        
        // Handle orders based on the active tab and completion status
        let filteredOrders = data.orders || [];
        let filteredCount = 0;
        
        if (activeTab === "with-completion" && Array.isArray(data.orders)) {
          filteredOrders = data.orders.filter(order => {
            // Check if the order has completion details and status is success
            return (
              order.completionDetails && 
              order.completionDetails.data && 
              order.completionDetails.data.status === "success"
            );
          });
          
          filteredCount = filteredOrders.length;
          console.log(`Filtered ${filteredCount} completed orders with success status`);
        }
        
        // Add specific messaging if API returned success:false
        if (data.searchResponse && data.searchResponse.success === false) {
          toast.warning(`Search API returned: ${data.searchResponse.code || 'Unknown error'} - ${data.searchResponse.message || ''}`);
          setShouldContinueFetching(false);
        } else if (data.completionResponse && data.completionResponse.success === false) {
          toast.warning(`Completion API returned: ${data.completionResponse.code || 'Unknown error'} - ${data.completionResponse.message || ''}`);
          setShouldContinueFetching(false);
        } else {
          // Check if we need to continue fetching 
          const hasContinuation = !!(data.after_tag || 
                                  (data.paginationProgress?.afterTag && !data.paginationProgress?.isComplete));
          
          if (hasContinuation) {
            console.log(`More pages available. after_tag: ${data.after_tag || data.paginationProgress?.afterTag}`);
            // Update all collected orders for the next request
            setAllCollectedOrders(previousOrders.length > 0 ? [...previousOrders, ...filteredOrders] : filteredOrders);
            setShouldContinueFetching(true);
          } else {
            console.log("Final page reached or pagination complete");
            setShouldContinueFetching(false);
            
            // Display success message
            if (activeTab === "with-completion") {
              toast.success(`Retrieved ${filteredCount} completed orders out of ${data.totalCount || 0} total orders`);
            } else {
              toast.success(`Retrieved ${data.totalCount || 0} orders`);
            }
          }
        }
        
        // Set the filtered response
        setResponse({
          ...data,
          orders: activeTab === "with-completion" ? filteredOrders : data.orders,
          filteredCount: filteredCount,
        });
      }
    } catch (error) {
      console.error("Exception fetching orders:", error);
      toast.error(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      setResponse({ error: String(error) });
      setShouldContinueFetching(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to start the initial fetch
  const handleFetchOrders = () => {
    setShouldContinueFetching(false); // Reset this flag
    fetchOrders(); // Start a fresh fetch without afterTag
  };

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
