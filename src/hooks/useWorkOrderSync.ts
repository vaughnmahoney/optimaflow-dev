
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
      
      // Step 2: Call the get-orders-with-completion edge function
      const { data: ordersData, error: fetchError } = await supabase.functions.invoke(
        'get-orders-with-completion',
        {
          body: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            validStatuses: ['success', 'failed', 'rejected']
          }
        }
      );

      if (fetchError) throw new Error(`Failed to fetch orders: ${fetchError.message}`);
      
      if (!ordersData?.orders || ordersData.orders.length === 0) {
        toast.info("No new orders found to import");
        setIsSyncing(false);
        return;
      }
      
      console.log(`Found ${ordersData.orders.length} orders to import`);
      toast.info(`Found ${ordersData.orders.length} orders to import...`);

      // Step 3: Import the fetched orders to the database
      const { data: importResult, error: importError } = await supabase.functions.invoke(
        'import-bulk-orders',
        {
          body: { orders: ordersData.orders }
        }
      );

      if (importError) throw new Error(`Failed to import orders: ${importError.message}`);
      
      // Step 4: Show the results
      if (importResult) {
        const { imported, duplicates, errors } = importResult;
        
        if (imported > 0) {
          toast.success(`Imported ${imported} new work orders`);
        } else if (duplicates > 0 && imported === 0) {
          toast.info(`All ${duplicates} orders already exist in the system`);
        }
        
        if (errors > 0) {
          toast.error(`Failed to import ${errors} orders`);
        }
      }
      
      // Step 5: Refresh the work orders list
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
