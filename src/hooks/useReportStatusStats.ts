import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StatusCount {
  status: string | null; // Status can potentially be null
  count: number;
}

interface UseReportStatusStatsReturn {
  isLoading: boolean;
  statusData: StatusCount[] | null;
  error: string | null;
}

export const useReportStatusStats = (
  reportDate: string | null,
  selectedDrivers: string[],
  selectedCustomerGroups: string[],
  selectedCustomerNames: string[]
): UseReportStatusStatsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState<StatusCount[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[useReportStatusStats] Hook triggered with reportDate:`, reportDate); // <-- ADDED: Log input date
    console.log(`[useReportStatusStats] Hook triggered with filters:`, {
      selectedDrivers,
      selectedCustomerGroups,
      selectedCustomerNames,
    }); // <-- ADDED: Log filters
    
    // Reset state when date is cleared or becomes invalid
    if (!reportDate) {
      setStatusData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const fetchStatusData = async () => {
      setIsLoading(true);
      setError(null);
      setStatusData(null); // Clear previous data

      try {
        // Calculate date range for the selected day
        const startDate = new Date(reportDate + 'T00:00:00.000Z'); // Start of day in UTC
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); // Start of next day

        const startOfDayISO = startDate.toISOString();
        const startOfNextDayISO = endDate.toISOString();

        console.log(`[useReportStatusStats] Fetching status counts for end_time between ${startOfDayISO} and ${startOfNextDayISO}`);

        // Define expected shape of raw data from DB
        type RawStatusData = { optimoroute_status: string | null };

        // Build filters as an object for logging
        const filters = {
          date: { start: startOfDayISO, end: startOfNextDayISO },
          drivers: selectedDrivers.length > 0 ? selectedDrivers : null,
          customerGroups: selectedCustomerGroups.length > 0 ? selectedCustomerGroups : null,
          customerNames: selectedCustomerNames.length > 0 ? selectedCustomerNames : null
        };
        
        console.log(`[useReportStatusStats] Applying filters:`, filters);
        
        // Start with base query
        let query = supabase.from('reports').select('optimoroute_status');
        
        // Always apply date range filter
        query = query.gte('end_time', startOfDayISO).lt('end_time', startOfNextDayISO);
        
        // Apply additional filters only if they have values
        if (selectedDrivers.length > 0) {
          query = query.in('tech_name', selectedDrivers); // Changed from driver_id to tech_name
        }
        
        if (selectedCustomerGroups.length > 0) {
          query = query.in('cust_group', selectedCustomerGroups); // Changed from customer_group_id to cust_group
        }
        
        if (selectedCustomerNames.length > 0) {
          query = query.in('cust_name', selectedCustomerNames); // Changed from customer_name to cust_name
        }
        
        // Execute the query
        const { data: rawData, error: dbError } = await query;
        
        console.log(`[useReportStatusStats] Raw data fetched from DB:`, rawData); // <-- ADDED: Log raw fetched data
        
        if (dbError) {
          throw dbError; // Throw error to be caught by catch block
        }

        // Perform grouping client-side
        const counts: { [key: string]: number } = {};
        if (rawData) {
          (rawData as RawStatusData[]).forEach((item) => {
            const key = item.optimoroute_status || 'Unknown'; // Group null statuses as 'Unknown'
            counts[key] = (counts[key] || 0) + 1;
          });
        }
        
        // Map to final StatusCount structure, ensuring count is a number
        const groupedData: StatusCount[] = Object.entries(counts).map(([status, count]) => ({
          status: status === 'Unknown' ? null : status,
          count: Number(count), // Ensure count is number
        }));
        
        // Sort for consistent order (optional)
        groupedData.sort((a, b) => b.count - a.count); 

        console.log('[useReportStatusStats] Status counts fetched and grouped:', groupedData);
        // Explicitly set the correctly typed data
        setStatusData(groupedData);
        
      } catch (err: any) {
        console.error('[useReportStatusStats] Error fetching/processing status counts:', err);
        const errorMessage = err.message || 'Unknown error';
        toast.error(`Error fetching stats: ${errorMessage}`);
        setError(errorMessage);
        setStatusData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusData();

    // Dependency array: re-run effect when date or filters change
  }, [reportDate, selectedDrivers, selectedCustomerGroups, selectedCustomerNames]);

  return { isLoading, statusData, error };
};
