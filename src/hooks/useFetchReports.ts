
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFetchReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
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
      
      if (error) {
        console.error("Error calling fetch-reports:", error);
        toast.error(`Error fetching reports: ${error.message || 'Unknown error'}`);
        setResults({ success: false, error: error.message });
        return;
      }
      
      // Set results
      setResults(data);
      
      // Display success/error message
      if (data && typeof data === 'string' && data.includes('Successfully updated')) {
        toast.success(data);
      } else if (data && data.success) {
        toast.success("Reports fetched successfully");
      } else {
        toast.warning(data || "No response from edge function");
      }
      
    } catch (error: any) {
      console.error("Error in fetchReports:", error);
      toast.error(`Error: ${error.message || 'Unknown error'}`);
      setResults({ success: false, error: error.message });
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
