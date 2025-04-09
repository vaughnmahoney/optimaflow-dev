
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AverageJobDurationData {
  hours: number;
  minutes: number;
  jobCount: number;
  totalMinutes: number;
}

export const useAverageJobDuration = (
  reportDate: string | null,
  selectedDrivers: string[] = [],
  selectedCustomerGroups: string[] = [],
  selectedCustomerNames: string[] = []
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AverageJobDurationData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!reportDate) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('reports')
          .select('job_duration, order_no')
          .eq('status', 'Completed')  // Only consider completed jobs
          .not('job_duration', 'is', null) // Only jobs with duration data
          .gte('end_time', `${reportDate}T00:00:00`)
          .lt('end_time', `${reportDate}T23:59:59`);

        // Apply driver filter if any drivers are selected
        if (selectedDrivers.length > 0) {
          query = query.in('tech_name', selectedDrivers);
        }

        // Apply customer group filter if any groups are selected
        if (selectedCustomerGroups.length > 0) {
          query = query.in('cust_group', selectedCustomerGroups);
        }

        // Apply customer name filter if any names are selected
        if (selectedCustomerNames.length > 0) {
          query = query.in('cust_name', selectedCustomerNames);
        }

        const { data: jobsWithDuration, error: fetchError } = await query;

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!jobsWithDuration || jobsWithDuration.length === 0) {
          setData({
            hours: 0,
            minutes: 0,
            jobCount: 0,
            totalMinutes: 0
          });
          setIsLoading(false);
          return;
        }

        // Process job_duration: 'PT1H30M' format
        let totalMinutes = 0;
        const jobCount = jobsWithDuration.length;

        jobsWithDuration.forEach(job => {
          if (job.job_duration) {
            const durationStr = String(job.job_duration);
            // Extract hours and minutes from PT0H0M format
            const hoursMatch = durationStr.match(/(\d+)H/);
            const minutesMatch = durationStr.match(/(\d+)M/);
            
            const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
            const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
            
            totalMinutes += hours * 60 + minutes;
          }
        });

        const averageMinutes = jobCount > 0 ? totalMinutes / jobCount : 0;
        const hours = Math.floor(averageMinutes / 60);
        const minutes = Math.round(averageMinutes % 60);

        setData({
          hours,
          minutes,
          jobCount,
          totalMinutes: Math.round(averageMinutes)
        });
      } catch (err: any) {
        console.error('Error fetching average job duration:', err);
        setError(err.message || 'Failed to fetch average job duration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [reportDate, selectedDrivers, selectedCustomerGroups, selectedCustomerNames]);

  return { isLoading, data, error };
};
