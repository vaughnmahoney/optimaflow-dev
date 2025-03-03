
import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BulkOrdersForm } from "@/components/bulk-orders/BulkOrdersForm";
import { ApiResponseDisplay } from "@/components/bulk-orders/ApiResponseDisplay";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";
import { Progress } from "@/components/ui/progress";

const BulkOrdersTest = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BulkOrdersResponse | null>(null);
  const [activeTab, setActiveTab] = useState("search-only");

  const fetchOrders = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    setResponse(null);

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

      // Initialize response with pagination progress
      setResponse({
        paginationProgress: {
          currentPage: 1,
          totalOrdersRetrieved: 0,
          isComplete: false
        }
      });

      // Call the selected edge function with pagination support
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          enablePagination: true  // Signal that we want to paginate
        }
      });

      if (error) {
        console.error(`Error fetching orders:`, error);
        toast.error(`Error: ${error.message}`);
        setResponse({ error: error.message });
      } else {
        console.log("API response:", data);
        
        // Filter orders with successful completion status 
        // (only when we have completion data and are in the completion tab)
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
        } else if (data.completionResponse && data.completionResponse.success === false) {
          toast.warning(`Completion API returned: ${data.completionResponse.code || 'Unknown error'} - ${data.completionResponse.message || ''}`);
        } else {
          if (activeTab === "with-completion") {
            toast.success(`Retrieved ${filteredCount} completed orders out of ${data.totalCount || 0} total orders`);
          } else {
            toast.success(`Retrieved ${data.totalCount || 0} orders`);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Bulk Orders API Test</h1>
      
      <BulkOrdersForm
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={isLoading}
        onFetchOrders={fetchOrders}
      />
      
      {response?.paginationProgress && !response.paginationProgress.isComplete && isLoading && (
        <div className="my-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Fetching page {response.paginationProgress.currentPage}{response.paginationProgress.totalPages ? ` of ${response.paginationProgress.totalPages}` : ''}...</span>
            <span>{response.paginationProgress.totalOrdersRetrieved} orders retrieved so far</span>
          </div>
          <Progress value={response.paginationProgress.totalPages 
            ? (response.paginationProgress.currentPage / response.paginationProgress.totalPages) * 100 
            : undefined} 
          />
        </div>
      )}
      
      <ApiResponseDisplay response={response} />
    </div>
  );
};

export default BulkOrdersTest;
