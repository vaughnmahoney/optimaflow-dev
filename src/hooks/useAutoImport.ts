
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook that provides functionality to trigger auto import of work orders
 */
export const useAutoImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();

  /**
   * Triggers the auto-import edge function and handles the response
   */
  const runAutoImport = async () => {
    setIsImporting(true);
    toast.info("Please wait, importing work orders...", {
      duration: 10000 // Longer duration to ensure message stays visible during import
    });

    try {
      const { data, error } = await supabase.functions.invoke('auto-import-orders', {
        body: {}
      });

      if (error) {
        console.error("Auto-import error:", error);
        toast.error(`Import failed: ${error.message}`);
        return false;
      }

      if (data.success) {
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
    runAutoImport
  };
};
