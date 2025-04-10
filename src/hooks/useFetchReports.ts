import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FetchReportsResult {
  success: boolean;
  count?: number;
  message?: string;
  error?: string;
}

export const useFetchReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FetchReportsResult | null>(null);
  
  const fetchReports = async (date?: string) => {
    setIsLoading(true);
    setResults(null);
    
    try {
      // Use the provided date or default to today
      const reportDate = date || new Date().toISOString().slice(0, 10);
      console.log(`Fetching reports for date: ${reportDate}`);
      
      // Call the fetch-reports edge function
      const { data, error } = await supabase.functions.invoke('fetch-reports', {
        body: { date: reportDate },
        method: 'POST',
      });
      
      console.log("[useFetchReports] Raw response from invoke:", { data, error });
      
      if (error) {
        console.error("Error calling fetch-reports:", error);
        toast.error(`Error fetching reports: ${error.message || 'Unknown error'}`);
        const errorResult = { success: false, error: error.message };
        console.log("[useFetchReports] Setting error result state:", errorResult);
        setResults(errorResult);
        return;
      }
      
      console.log("Response from fetch-reports:", data);
      
      // Set results
      console.log("[useFetchReports] Setting success result state:", data);
      setResults(data);
      
      // Display success/error message
      if (data && data.success) {
        toast.success(data.message || `Successfully fetched ${data.count || 0} reports`);
      } else {
        toast.error(data?.error || "Error fetching reports");
      }
      
    } catch (error: any) {
      console.error("Error in fetchReports:", error);
      toast.error(`Error: ${error.message || 'Unknown error'}`);
      const catchResult = { success: false, error: error.message };
      console.log("[useFetchReports] Setting catch block result state:", catchResult);
      setResults(catchResult);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    fetchReports,
    isLoading,
    results
  };
};
