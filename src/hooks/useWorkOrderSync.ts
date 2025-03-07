
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

      // Call the get-orders-with-completion function with saveToDatabase=true
      const { data, error } = await supabase.functions.invoke('get-orders-with-completion', {
        body: {
          startDate,
          endDate,
          validStatuses: ['success', 'failed', 'rejected'],
          saveToDatabase: true // Explicitly request database saving
        }
      });

      if (error) {
        throw new Error(`Error syncing work orders: ${error.message}`);
      }

      // Show success message with stats
      const savedStats = data.dbSaveStats || { successful: 0, failed: 0 };
      
      if (savedStats.successful > 0) {
        toast.success(`Successfully synced ${savedStats.successful} work orders`);
      } else if (data.filteredCount === 0) {
        toast.info('No new work orders found to sync');
      } else {
        toast.warning('Sync completed but no orders were saved');
      }

      // If any failed, show warning
      if (savedStats.failed > 0) {
        toast.warning(`Failed to sync ${savedStats.failed} work orders`);
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
