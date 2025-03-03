
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

export interface BulkOrderLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
  locationNo?: string;
  locationName?: string;
  notes?: string;
}

export interface BulkOrder {
  id: string;
  orderNo: string;
  date: string;
  type: string;
  status?: string;
  location?: BulkOrderLocation;
  notes?: string;
}

export const useBulkOrdersFetch = () => {
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBulkOrders = async (dateRange: DateRange) => {
    if (!dateRange.from) {
      setError('Start date is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Format dates to YYYY-MM-DD
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : startDate;
      
      // Call the Edge Function to fetch bulk orders
      const { data, error } = await supabase.functions.invoke('bulk-get-orders', {
        body: {
          startDate,
          endDate,
          includeOrderData: true
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && Array.isArray(data)) {
        setBulkOrders(data);
      } else {
        setBulkOrders([]);
      }
    } catch (err) {
      console.error('Error fetching bulk orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setBulkOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    bulkOrders,
    isLoading,
    error,
    fetchBulkOrders
  };
};
