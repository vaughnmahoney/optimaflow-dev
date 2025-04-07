
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, subWeeks, format, parseISO } from "date-fns";

interface JobsStatsData {
  currentWeekTotal: number;
  previousWeekTotal: number;
  percentageChange: number;
  dailyCounts: {
    day: string;
    count: number;
  }[];
  isLoading: boolean;
  error: string | null;
  // Added diagnostic data
  diagnosticData: {
    totalRecords: number;
    recordsWithStatus: number;
    recordsWithEndTime: number;
    recordsWithValidDates: number;
    processedRecords: number;
    statuses: Record<string, number>;
  };
}

export function useJobsCompletedStats(): JobsStatsData {
  const [data, setData] = useState<JobsStatsData>({
    currentWeekTotal: 0,
    previousWeekTotal: 0,
    percentageChange: 0,
    dailyCounts: [],
    isLoading: true,
    error: null,
    diagnosticData: {
      totalRecords: 0,
      recordsWithStatus: 0,
      recordsWithEndTime: 0,
      recordsWithValidDates: 0, 
      processedRecords: 0,
      statuses: {}
    }
  });

  useEffect(() => {
    async function fetchJobsData() {
      try {
        // Calculate date ranges
        const now = new Date();
        const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 }); // Week starts on Monday
        const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const previousWeekStart = subWeeks(currentWeekStart, 1);
        const previousWeekEnd = subWeeks(currentWeekEnd, 1);
        
        // Format dates for Supabase query
        const currentStart = format(currentWeekStart, 'yyyy-MM-dd');
        const currentEnd = format(currentWeekEnd, 'yyyy-MM-dd');
        const prevStart = format(previousWeekStart, 'yyyy-MM-dd');
        const prevEnd = format(previousWeekEnd, 'yyyy-MM-dd');
        
        console.log(`Fetching jobs data for current week: ${currentStart} to ${currentEnd}`);
        console.log(`Fetching jobs data for previous week: ${prevStart} to ${prevEnd}`);
        
        // Diagnostic: Fetch all records first to get total count
        const { data: allWeekData, error: anyWeekError } = await supabase
          .from('reports')
          .select('end_time, optimoroute_status')
          .gte('end_time', currentStart)
          .lte('end_time', currentEnd);
          
        if (anyWeekError) {
          console.error("Error fetching all week data:", anyWeekError);
        }
        
        // Diagnostic data collection
        const diagnosticData = {
          totalRecords: allWeekData?.length || 0,
          recordsWithStatus: 0,
          recordsWithEndTime: 0,
          recordsWithValidDates: 0,
          processedRecords: 0,
          statuses: {} as Record<string, number>
        };
        
        // Count records with various properties
        if (allWeekData) {
          // Count status distribution
          allWeekData.forEach(record => {
            // Count records with optimoroute_status
            if (record.optimoroute_status) {
              diagnosticData.recordsWithStatus++;
              
              // Count by status type
              const status = record.optimoroute_status.toLowerCase();
              diagnosticData.statuses[status] = (diagnosticData.statuses[status] || 0) + 1;
            }
            
            // Count records with end_time
            if (record.end_time) {
              diagnosticData.recordsWithEndTime++;
              
              // Count records with valid end_time that can be parsed
              try {
                parseISO(record.end_time);
                diagnosticData.recordsWithValidDates++;
              } catch (error) {
                // Invalid date format
              }
            }
          });
        }
        
        console.log("Status distribution in database:", diagnosticData.statuses);
        
        // Fetch current week data with 'success' status
        const { data: currentWeekData, error: currentWeekError } = await supabase
          .from('reports')
          .select('end_time, optimoroute_status')
          .gte('end_time', currentStart)
          .lte('end_time', currentEnd)
          .eq('optimoroute_status', 'success');
        
        if (currentWeekError) {
          console.error("Error fetching current week data:", currentWeekError);
          throw new Error(currentWeekError.message);
        }
        
        diagnosticData.processedRecords = currentWeekData.length;
        console.log(`Found ${currentWeekData.length} 'success' records for current week`);
        
        // Fetch previous week data
        const { data: previousWeekData, error: previousWeekError } = await supabase
          .from('reports')
          .select('end_time, optimoroute_status')
          .gte('end_time', prevStart)
          .lte('end_time', prevEnd)
          .eq('optimoroute_status', 'success');
        
        if (previousWeekError) {
          console.error("Error fetching previous week data:", previousWeekError);
          throw new Error(previousWeekError.message);
        }
        
        console.log(`Found ${previousWeekData.length} 'success' records for previous week`);
        
        // Process daily counts for current week
        const dailyCountsMap: Record<string, number> = {};
        
        // Initialize all days of the week
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        dayNames.forEach(day => {
          dailyCountsMap[day] = 0;
        });
        
        // Count jobs by day
        currentWeekData.forEach(job => {
          if (job.end_time) {
            try {
              // Parse the date including timezone information if present
              const date = parseISO(job.end_time);
              const dayName = format(date, 'EEEE'); // Full day name
              dailyCountsMap[dayName] = (dailyCountsMap[dayName] || 0) + 1;
            } catch (error) {
              console.error(`Error parsing date: ${job.end_time}`, error);
            }
          }
        });
        
        console.log("Daily counts map:", dailyCountsMap);
        
        // Convert to array format for chart
        const dailyCounts = Object.entries(dailyCountsMap).map(([day, count]) => ({
          day,
          count
        }));
        
        // Sort by day of week
        dailyCounts.sort((a, b) => {
          return dayNames.indexOf(a.day) - dayNames.indexOf(b.day);
        });
        
        console.log("Final dailyCounts array for chart:", dailyCounts);
        
        // Calculate totals and percentage change
        const currentWeekTotal = currentWeekData.length;
        const previousWeekTotal = previousWeekData.length;
        
        // Calculate percentage change
        let percentageChange = 0;
        if (previousWeekTotal > 0) {
          percentageChange = ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;
        } else if (currentWeekTotal > 0) {
          percentageChange = 100; // If previous week was 0, but current week has jobs
        }
        
        console.log(`Current week total: ${currentWeekTotal}, Previous week total: ${previousWeekTotal}`);
        console.log(`Percentage change: ${percentageChange.toFixed(1)}%`);
        
        setData({
          currentWeekTotal,
          previousWeekTotal,
          percentageChange,
          dailyCounts,
          isLoading: false,
          error: null,
          diagnosticData
        });
        
      } catch (error) {
        console.error("Error fetching jobs completed stats:", error);
        setData({
          ...data,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error occurred"
        });
      }
    }

    fetchJobsData();
  }, []);

  return data;
}
