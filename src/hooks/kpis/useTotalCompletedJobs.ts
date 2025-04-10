import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JobCountItem {
  name: string; // Name of the group (tech_name or cust_group)
  count: number; // Number of completed jobs for this group
}

interface TotalCompletedJobsData {
  totalCompleted: number; // Total number of successfully completed jobs
  byDriver: JobCountItem[]; // Jobs grouped by driver
  byCustomerGroup: JobCountItem[]; // Jobs grouped by customer group
}

interface UseTotalCompletedJobsReturn {
  isLoading: boolean;
  data: TotalCompletedJobsData | null;
  error: string | null;
}

/**
 * Hook to calculate the total number of successfully completed jobs
 * based on the optimoroute_status field in the reports table.
 */
export const useTotalCompletedJobs = (
  reportDate: string | null,
  selectedDrivers: string[],
  selectedCustomerGroups: string[],
  selectedCustomerNames: string[]
): UseTotalCompletedJobsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TotalCompletedJobsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[useTotalCompletedJobs] Hook triggered with reportDate:`, reportDate);
    console.log(`[useTotalCompletedJobs] Hook triggered with filters:`, {
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

    const fetchTotalCompletedJobs = async () => {
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

        console.log(`[useTotalCompletedJobs] Fetching data for end_time between ${startOfDayISO} and ${startOfNextDayISO}`);

        // Build filters as an object for logging
        const filters = {
          date: { start: startOfDayISO, end: startOfNextDayISO },
          drivers: selectedDrivers.length > 0 ? selectedDrivers : null,
          customerGroups: selectedCustomerGroups.length > 0 ? selectedCustomerGroups : null,
          customerNames: selectedCustomerNames.length > 0 ? selectedCustomerNames : null
        };
        
        console.log(`[useTotalCompletedJobs] Applying filters:`, filters);
        
        // Start with base query - include fields needed for grouping
        let query = supabase.from('reports').select('optimoroute_status, tech_name, cust_group, cust_name');
        
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
          console.log('[useTotalCompletedJobs] No data found for the selected filters');
          setData({
            totalCompleted: 0,
            byDriver: [],
            byCustomerGroup: []
          });
          setIsLoading(false);
          return;
        }

        // Log the raw data to see what status values we have
        console.log(`[useTotalCompletedJobs] Raw data fetched, ${rawData.length} records`);
        
        // Consider multiple possible success status values (case insensitive)
        const successStatuses = ['success', 'completed', 'complete', 'done'];
        
        // Filter for completed jobs
        const completedJobs = rawData.filter(item => {
          // If status is null or undefined, it's not a success
          if (!item.optimoroute_status) return false;
          
          // Check if the status matches any of our success statuses (case insensitive)
          const status = item.optimoroute_status.toLowerCase();
          return successStatuses.includes(status);
        });
        
        const totalCompleted = completedJobs.length;
        console.log(`[useTotalCompletedJobs] Found ${totalCompleted} completed jobs`);
        
        // Group completed jobs by driver (tech_name)
        const driverCounts: Record<string, number> = {};
        completedJobs.forEach(job => {
          const driverName = job.tech_name || 'Unknown';
          driverCounts[driverName] = (driverCounts[driverName] || 0) + 1;
        });
        
        // Group completed jobs by customer group
        const groupCounts: Record<string, number> = {};
        completedJobs.forEach(job => {
          const groupName = job.cust_group || 'Unknown';
          groupCounts[groupName] = (groupCounts[groupName] || 0) + 1;
        });
        
        // Convert to arrays and sort by count (descending)
        const byDriver = Object.entries(driverCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // Top 10 drivers
        
        const byCustomerGroup = Object.entries(groupCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // Top 10 customer groups
        
        console.log(`[useTotalCompletedJobs] Grouped data:`, { byDriver, byCustomerGroup });
        
        setData({ 
          totalCompleted,
          byDriver,
          byCustomerGroup
        });
        
      } catch (err: any) {
        console.error('[useTotalCompletedJobs] Error calculating total completed jobs:', err);
        const errorMessage = err.message || 'Unknown error';
        toast.error(`Error calculating total completed jobs: ${errorMessage}`);
        setError(errorMessage);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalCompletedJobs();

  }, [reportDate, selectedDrivers, selectedCustomerGroups, selectedCustomerNames]);

  return { isLoading, data, error };
};
