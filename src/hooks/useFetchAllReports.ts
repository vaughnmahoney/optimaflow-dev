
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FetchAllReportsResult {
  success: boolean;
  totalOrders?: number;
  ordersProcessed?: number;
  ordersWithLdsData?: number;
  updatedInDatabase?: number;
  errors?: number;
  error?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export const useFetchAllReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FetchAllReportsResult | null>(null);
  
  const fetchAllReports = async (startDate: string, endDate: string) => {
    setIsLoading(true);
    setResults(null);
    
    try {
      console.log(`Fetching all reports for date range: ${startDate} to ${endDate}`);
      
      // Call the all-reports edge function
      const { data, error } = await supabase.functions.invoke('all-reports', {
        body: { startDate, endDate },
        method: 'POST',
      });
      
      console.log("[useFetchAllReports] Raw response:", { data, error });
      
      if (error) {
        console.error("Error calling all-reports function:", error);
        toast.error(`Error fetching reports: ${error.message || 'Unknown error'}`);
        setResults({ success: false, error: error.message });
        return;
      }
      
      // Set results
      setResults(data);
      
      // Display success/error message
      if (data && data.success) {
        toast.success(`Successfully processed ${data.ordersProcessed || 0} orders, updated ${data.updatedInDatabase || 0} with LDS data`);
      } else {
        toast.error(data?.error || "Error processing reports");
      }
      
    } catch (error: any) {
      console.error("Error in fetchAllReports:", error);
      toast.error(`Error: ${error.message || 'Unknown error'}`);
      setResults({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    fetchAllReports,
    isLoading,
    results
  };
};
