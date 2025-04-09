
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AverageDurationResult {
  hours: number;
  minutes: number;
  jobCount: number;
}

export const useAverageJobDuration = (
  reportDate: string | null,
  selectedDrivers: string[],
  selectedCustomerGroups: string[],
  selectedCustomerNames: string[]
) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AverageDurationResult | null>(null);

  useEffect(() => {
    const fetchAverageDuration = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build the query with filters
        let query = supabase
          .from('reports')
          .select('start_time, end_time')
          .not('start_time', 'is', null)
          .not('end_time', 'is', null);

        // Apply date filter if provided
        if (reportDate) {
          const startOfDay = `${reportDate}T00:00:00`;
          const endOfDay = `${reportDate}T23:59:59`;
          
          query = query
            .gte('end_time', startOfDay)
            .lte('end_time', endOfDay);
        }

        // Apply driver filter if provided
        if (selectedDrivers && selectedDrivers.length > 0) {
          query = query.in('tech_name', selectedDrivers);
        }

        // Apply customer group filter if provided
        if (selectedCustomerGroups && selectedCustomerGroups.length > 0) {
          query = query.in('cust_group', selectedCustomerGroups);
        }

        // Apply customer name filter if provided
        if (selectedCustomerNames && selectedCustomerNames.length > 0) {
          query = query.in('cust_name', selectedCustomerNames);
        }

        const { data: jobsData, error: jobsError } = await query;

        if (jobsError) {
          throw new Error(jobsError.message);
        }

        // Calculate the average duration
        if (jobsData && jobsData.length > 0) {
          let totalMinutes = 0;
          let validJobsCount = 0;

          jobsData.forEach(job => {
            if (job.start_time && job.end_time) {
              const startTime = new Date(job.start_time);
              const endTime = new Date(job.end_time);
              
              // Only calculate if both dates are valid
              if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
                const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
                
                // Only count positive durations that are reasonably within service time (less than 24 hours)
                if (durationMinutes > 0 && durationMinutes < 24 * 60) {
                  totalMinutes += durationMinutes;
                  validJobsCount++;
                }
              }
            }
          });

          if (validJobsCount > 0) {
            const avgMinutes = totalMinutes / validJobsCount;
            const hours = Math.floor(avgMinutes / 60);
            const minutes = Math.round(avgMinutes % 60);
            
            setData({
              hours,
              minutes,
              jobCount: validJobsCount
            });
          } else {
            setData(null);
          }
        } else {
          setData(null);
        }
      } catch (err: any) {
        console.error("Error fetching average job duration:", err);
        setError(err.message || "Failed to fetch average job duration");
        toast.error("Failed to load average job duration");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAverageDuration();
  }, [reportDate, selectedDrivers, selectedCustomerGroups, selectedCustomerNames]);

  return { isLoading, data, error };
};
