
import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BulkOrdersResponse {
  success?: boolean;
  error?: string;
  orders?: any[];
  totalCount?: number;
  raw?: any;
}

export function useBulkOrderImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BulkOrdersResponse | null>(null);

  const importOrders = async (startDate: Date, endDate: Date) => {
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

      console.log(`Calling bulk-get-orders function with dates: ${formattedStartDate} to ${formattedEndDate}`);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("bulk-get-orders", {
        body: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });

      if (error) {
        console.error("Error fetching bulk orders:", error);
        toast.error(`Error: ${error.message}`);
        setResponse({ error: error.message });
        return null;
      }
      
      console.log("Bulk orders response:", data);
      
      // Add specific messaging if API returned success:false
      if (data.raw && data.raw.success === false) {
        if (data.raw.code) {
          toast.warning(`API returned: ${data.raw.code}${data.raw.message ? ` - ${data.raw.message}` : ''}`);
        } else {
          toast.warning("API returned success:false without an error code");
        }
      } else {
        toast.success(`Retrieved ${data.totalCount || 0} orders`);
      }
      
      setResponse(data);
      return data;
    } catch (error) {
      console.error("Exception fetching bulk orders:", error);
      toast.error(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      setResponse({ error: String(error) });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    importOrders,
    isLoading,
    response
  };
}

export default useBulkOrderImport;
