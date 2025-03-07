
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useWorkOrderSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const syncWorkOrders = useCallback(async () => {
    setIsSyncing(true);
    toast.info('Syncing work orders from OptimoRoute...');

    try {
      // Get date range for last 7 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Call the sync-work-orders function which handles smaller batches internally
      const { data, error } = await supabase.functions.invoke('sync-work-orders', {
        body: {
          startDate,
          endDate,
          validStatuses: ['success', 'failed', 'rejected']
        }
      });

      if (error) {
        throw new Error(`Error syncing work orders: ${error.message}`);
      }

      if (data.success) {
        const totalImported = data.imported || 0;
        const totalDuplicates = data.duplicates || 0;
        const totalErrors = data.errors || 0;
        
        // Show success message with stats
        if (totalImported > 0) {
          toast.success(`Successfully synced ${totalImported} work orders`);
        } else if (totalDuplicates > 0 && totalImported === 0) {
          toast.info(`No new work orders to sync (${totalDuplicates} already exist)`);
        } else {
          toast.info('No new work orders found to sync');
        }

        // If any failed, show warning
        if (totalErrors > 0) {
          toast.warning(`Failed to sync ${totalErrors} work orders`);
        }
      } else {
        // Handle failure case
        toast.error(data.error || 'Failed to sync work orders');
      }

      // Refresh work orders data
      await queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in syncWorkOrders:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sync work orders');
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  }, [queryClient]);

  return { syncWorkOrders, isSyncing };
}
