
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for syncing new work orders from OptimoRoute
 */
export const useWorkOrderSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const syncWorkOrders = async () => {
    setIsSyncing(true);
    toast.info("Syncing work orders...");

    try {
      // Step 1: Get current date minus 7 days and format it for the API
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      console.log(`Fetching orders from ${formattedStartDate} to ${formattedEndDate}`);
      
      // Step 2: Call the combined sync-work-orders edge function
      const { data: syncResult, error } = await supabase.functions.invoke(
        'sync-work-orders',
        {
          body: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            validStatuses: ['success', 'failed', 'rejected']
          }
        }
      );

      if (error) throw new Error(`Failed to sync orders: ${error.message}`);
      
      if (!syncResult) {
        toast.error("Failed to sync work orders: No response from server");
        return;
      }
      
      // Step 3: Show the results
      const { imported, duplicates, errors } = syncResult;
      
      if (imported > 0) {
        toast.success(`Imported ${imported} new work orders`);
      } else if (duplicates > 0 && imported === 0) {
        toast.info(`All ${duplicates} orders already exist in the system`);
      } else if (imported === 0 && duplicates === 0) {
        toast.info("No new orders found to import");
      }
      
      if (errors > 0) {
        toast.error(`Failed to import ${errors} orders`);
      }
      
      // Step 4: Refresh the work orders list
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
      
    } catch (error) {
      console.error("Sync error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sync work orders");
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncWorkOrders,
    isSyncing
  };
};
