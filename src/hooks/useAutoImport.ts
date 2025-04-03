
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook that provides functionality to trigger auto import of work orders
 */
export const useAutoImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    percentage: number;
    current?: number;
    total?: number;
  } | null>(null);
  const queryClient = useQueryClient();

  /**
   * Triggers the auto-import edge function and handles the response
   */
  const runAutoImport = async () => {
    setIsImporting(true);
    setImportProgress({ percentage: 0 });
    toast.info("Please wait, importing work orders...", {
      duration: 10000 // Longer duration to ensure message stays visible during import
    });

    try {
      // Create an AbortController to handle timeouts
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 60000); // 60 second timeout
      
      // Set up progress updates via EventSource
      let progressEventSource: EventSource | null = null;
      let progressInterval: number | null = null;
      
      try {
        // Start a long-running connection to track progress
        const progressUrl = `${import.meta.env.VITE_SUPABASE_URL || 'https://eijdqiyvuhregbydndnb.supabase.co'}/functions/v1/auto-import-orders/progress`;
        progressEventSource = new EventSource(progressUrl);
        
        progressEventSource.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.progress) {
              setImportProgress({
                percentage: Math.round(data.progress.percentage),
                current: data.progress.current,
                total: data.progress.total
              });
            }
          } catch (err) {
            console.error('Error parsing progress event:', err);
          }
        });
        
        progressEventSource.addEventListener('error', () => {
          // Automatically try to reconnect
          console.log('Progress event source error, will reconnect automatically');
        });
      } catch (err) {
        console.error('Failed to set up progress tracking:', err);
        
        // If progress tracking fails, use a simulated progress bar
        let simulatedPercentage = 0;
        progressInterval = window.setInterval(() => {
          // Simulate progress, slowly at first then faster
          simulatedPercentage += simulatedPercentage < 30 ? 1 : 
                              simulatedPercentage < 60 ? 0.7 : 
                              simulatedPercentage < 85 ? 0.4 : 0.1;
          
          // Cap at 95% until we get the actual result
          if (simulatedPercentage > 95) {
            simulatedPercentage = 95;
            if (progressInterval) clearInterval(progressInterval);
          }
          
          setImportProgress({
            percentage: Math.min(Math.round(simulatedPercentage), 95)
          });
        }, 200);
      }

      // Call the actual import function
      const { data, error } = await supabase.functions.invoke('auto-import-orders', {
        body: {}
      });

      // Clean up
      clearTimeout(timeoutId);
      if (progressEventSource) {
        progressEventSource.close();
      }
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      if (error) {
        console.error("Auto-import error:", error);
        toast.error(`Import failed: ${error.message}`);
        return false;
      }

      if (data.success) {
        // Set progress to 100% when done
        setImportProgress({ 
          percentage: 100, 
          current: data.imported + data.duplicates, 
          total: data.imported + data.duplicates 
        });
        
        // Calculate the correct message based on the results
        let successMessage = `Import complete. `;
        
        if (data.imported > 0) {
          successMessage += `${data.imported} new orders imported`;
        } else if (data.duplicates > 0 && data.imported === 0) {
          successMessage += `No new orders to import (${data.duplicates} duplicates skipped)`;
        } else {
          successMessage += `No new orders found`;
        }
        
        toast.success(successMessage);

        // Only invalidate queries if we have new data or we want to refresh anyway
        await queryClient.invalidateQueries({ queryKey: ["workOrders"] });
        await queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
        
        // Set a timeout to clear the progress indicator after 3 seconds
        setTimeout(() => {
          setImportProgress(null);
        }, 3000);
        
        return true;
      } else {
        toast.warning(`Import completed with issues: ${data.error || "Unknown error"}`);
        return false;
      }
    } catch (error) {
      console.error("Auto-import exception:", error);
      toast.error(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    importProgress,
    runAutoImport
  };
};
