
import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrdersResponse {
  success?: boolean;
  error?: string;
  orders?: any[];
  totalCount?: number;
  searchResponse?: any;
  completionResponse?: any;
}

export function useOrdersWithCompletion() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<OrdersResponse | null>(null);

  const fetchOrdersWithCompletion = async (startDate: Date, endDate: Date) => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return null;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      // Format dates as ISO strings
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      console.log(`Calling get-orders-with-completion with dates: ${formattedStartDate} to ${formattedEndDate}`);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("get-orders-with-completion", {
        body: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });

      if (error) {
        console.error("Error fetching orders with completion:", error);
        toast.error(`Error: ${error.message}`);
        setResponse({ error: error.message });
        return null;
      }
      
      console.log("Orders with completion response:", data);
      
      // Add specific messaging if API returned success:false
      if (data.searchResponse && data.searchResponse.success === false) {
        toast.warning(`Search API returned: ${data.searchResponse.code || 'Unknown error'} ${data.searchResponse.message ? `- ${data.searchResponse.message}` : ''}`);
      } else if (data.completionResponse && data.completionResponse.success === false) {
        toast.warning(`Completion API returned: ${data.completionResponse.code || 'Unknown error'} ${data.completionResponse.message ? `- ${data.completionResponse.message}` : ''}`);
      } else {
        toast.success(`Retrieved ${data.totalCount || 0} orders with completion details`);
      }
      
      setResponse(data);
      return data;
    } catch (error) {
      console.error("Exception fetching orders with completion:", error);
      toast.error(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      setResponse({ error: String(error) });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchOrdersWithCompletion,
    isLoading,
    response
  };
}

export default useOrdersWithCompletion;
