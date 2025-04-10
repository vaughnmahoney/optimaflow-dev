import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompletionRateData {
  completionRate: number; // Percentage of successfully completed jobs
  totalJobs: number; // Total number of jobs attempted
  completedJobs: number; // Number of successfully completed jobs
}

interface UseCompletionRateReturn {
  isLoading: boolean;
  data: CompletionRateData | null;
  error: string | null;
}

/**
 * Hook to calculate the completion rate (percentage of jobs successfully completed)
 * based on the optimoroute_status field in the reports table.
 */
export const useCompletionRate = (
  reportDate: string | null,
  selectedDrivers: string[],
  selectedCustomerGroups: string[],
  selectedCustomerNames: string[]
): UseCompletionRateReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CompletionRateData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[useCompletionRate] Hook triggered with reportDate:`, reportDate);
    console.log(`[useCompletionRate] Hook triggered with filters:`, {
      selectedDrivers,
      selectedCustomerGroups,
      selectedCustomerNames,
    });
    
    // Reset state when date is cleared or becomes invalid
    if (!reportDate) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const fetchCompletionRate = async () => {
      setIsLoading(true);
      setError(null);
      setData(null); // Clear previous data

      try {
        // Calculate date range for the selected day
        const startDate = new Date(reportDate + 'T00:00:00.000Z'); // Start of day in UTC
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); // Start of next day

        const startOfDayISO = startDate.toISOString();
        const startOfNextDayISO = endDate.toISOString();

        console.log(`[useCompletionRate] Fetching data for end_time between ${startOfDayISO} and ${startOfNextDayISO}`);

        // Build filters as an object for logging
        const filters = {
          date: { start: startOfDayISO, end: startOfNextDayISO },
          drivers: selectedDrivers.length > 0 ? selectedDrivers : null,
          customerGroups: selectedCustomerGroups.length > 0 ? selectedCustomerGroups : null,
          customerNames: selectedCustomerNames.length > 0 ? selectedCustomerNames : null
        };
        
        console.log(`[useCompletionRate] Applying filters:`, filters);
        
        // Start with base query
        let query = supabase.from('reports').select('optimoroute_status');
        
        // Always apply date range filter
        query = query.gte('end_time', startOfDayISO).lt('end_time', startOfNextDayISO);
        
        // Apply additional filters only if they have values
        if (selectedDrivers.length > 0) {
          query = query.in('tech_name', selectedDrivers);
        }
        
        if (selectedCustomerGroups.length > 0) {
          query = query.in('cust_group', selectedCustomerGroups);
        }
        
        if (selectedCustomerNames.length > 0) {
          query = query.in('cust_name', selectedCustomerNames);
        }
        
        // Execute the query
        const { data: rawData, error: dbError } = await query;
        
        if (dbError) {
          throw dbError;
        }

        if (!rawData || rawData.length === 0) {
          console.log('[useCompletionRate] No data found for the selected filters');
          setData({
            completionRate: 0,
            totalJobs: 0,
            completedJobs: 0
          });
          setIsLoading(false);
          return;
        }

        // Log the raw data to see what status values we have
        console.log(`[useCompletionRate] Raw data fetched, ${rawData.length} records`);
        
        // Log the unique status values to see what we're working with
        const uniqueStatuses = [...new Set(rawData.map(item => item.optimoroute_status))];
        console.log(`[useCompletionRate] Unique status values:`, uniqueStatuses);
        
        // Calculate completion rate - be more flexible with status values
        const totalJobs = rawData.length;
        
        // Consider multiple possible success status values (case insensitive)
        const successStatuses = ['success', 'completed', 'complete', 'done'];
        
        const completedJobs = rawData.filter(item => {
          // If status is null or undefined, it's not a success
          if (!item.optimoroute_status) return false;
          
          // Check if the status matches any of our success statuses (case insensitive)
          const status = item.optimoroute_status.toLowerCase();
          return successStatuses.includes(status);
        }).length;
        
        console.log(`[useCompletionRate] Found ${completedJobs} completed jobs out of ${totalJobs} total jobs`);
        
        const completionRate = totalJobs > 0 
          ? (completedJobs / totalJobs) * 100 
          : 0;
        
        const result: CompletionRateData = {
          completionRate: parseFloat(completionRate.toFixed(2)), // Round to 2 decimal places
          totalJobs,
          completedJobs
        };
        
        console.log('[useCompletionRate] Calculated completion rate:', result);
        
        setData(result);
        
      } catch (err: any) {
        console.error('[useCompletionRate] Error calculating completion rate:', err);
        const errorMessage = err.message || 'Unknown error';
        toast.error(`Error calculating completion rate: ${errorMessage}`);
        setError(errorMessage);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletionRate();

  }, [reportDate, selectedDrivers, selectedCustomerGroups, selectedCustomerNames]);

  return { isLoading, data, error };
};
