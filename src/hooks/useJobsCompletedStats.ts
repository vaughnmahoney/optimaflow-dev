
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TimeRange = "today" | "week" | "month" | "quarter";

export interface JobsCompletedStats {
  total: number;
  previousTotal: number;
  percentChange: number;
  topTechnician: {
    name: string;
    count: number;
  } | null;
  completionRate: number; // percentage of assigned jobs completed
  dailyCounts: { date: string; count: number }[]; // for sparkline
  isLoading: boolean;
}

export const useJobsCompletedStats = (initialTimeRange: TimeRange = "week") => {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [stats, setStats] = useState<JobsCompletedStats>({
    total: 0,
    previousTotal: 0,
    percentChange: 0,
    topTechnician: null,
    completionRate: 0,
    dailyCounts: [],
    isLoading: true
  });

  const fetchJobsCompletedStats = async (selectedTimeRange: TimeRange) => {
    setStats(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Get date ranges based on selected time range
      const { currentStart, currentEnd, previousStart, previousEnd } = getDateRanges(selectedTimeRange);
      
      console.log(`Fetching jobs completed stats for ${selectedTimeRange}`);
      console.log(`Current period: ${currentStart} to ${currentEnd}`);
      console.log(`Previous period: ${previousStart} to ${previousEnd}`);
      
      // Fetch current period data
      const { data: currentData, error: currentError } = await supabase
        .from('reports')
        .select('id, tech_name, optimoroute_status, scheduled_date')
        .gte('scheduled_date', currentStart)
        .lte('scheduled_date', currentEnd)
        .eq('optimoroute_status', 'success');
      
      if (currentError) throw currentError;
      
      // Fetch previous period data for comparison
      const { data: previousData, error: previousError } = await supabase
        .from('reports')
        .select('id')
        .gte('scheduled_date', previousStart)
        .lte('scheduled_date', previousEnd)
        .eq('optimoroute_status', 'success');
      
      if (previousError) throw previousError;
      
      // Fetch total assigned jobs for completion rate
      const { data: totalAssignedData, error: totalAssignedError } = await supabase
        .from('reports')
        .select('id')
        .gte('scheduled_date', currentStart)
        .lte('scheduled_date', currentEnd);
      
      if (totalAssignedError) throw totalAssignedError;
      
      // Process data
      const total = currentData?.length || 0;
      const previousTotal = previousData?.length || 0;
      const totalAssigned = totalAssignedData?.length || 0;
      
      // Calculate percent change
      const percentChange = previousTotal > 0 
        ? ((total - previousTotal) / previousTotal) * 100 
        : 0;
      
      // Calculate completion rate
      const completionRate = totalAssigned > 0 
        ? (total / totalAssigned) * 100 
        : 0;
      
      // Find top technician
      const techCounts: Record<string, number> = {};
      currentData?.forEach(job => {
        if (job.tech_name) {
          techCounts[job.tech_name] = (techCounts[job.tech_name] || 0) + 1;
        }
      });
      
      let topTechnician = null;
      if (Object.keys(techCounts).length > 0) {
        const topTechName = Object.keys(techCounts).reduce((a, b) => 
          techCounts[a] > techCounts[b] ? a : b
        );
        topTechnician = {
          name: topTechName,
          count: techCounts[topTechName]
        };
      }
      
      // Calculate daily counts for sparkline
      const dailyCounts = getDailyCounts(currentData || [], currentStart, currentEnd);
      
      setStats({
        total,
        previousTotal,
        percentChange,
        topTechnician,
        completionRate,
        dailyCounts,
        isLoading: false
      });
      
    } catch (error) {
      console.error("Error fetching jobs completed stats:", error);
      toast.error("Failed to load jobs completed statistics");
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  // Helper function to get date ranges based on selected time range
  const getDateRanges = (range: TimeRange) => {
    const now = new Date();
    let currentStart: Date;
    let currentEnd: Date = new Date(now);
    let previousStart: Date;
    let previousEnd: Date;
    
    switch (range) {
      case "today":
        currentStart = new Date(now.setHours(0, 0, 0, 0));
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 1);
        previousEnd = new Date(previousStart);
        previousEnd.setHours(23, 59, 59, 999);
        break;
        
      case "week":
        // Set to beginning of current week (Sunday)
        currentStart = new Date(now);
        const dayOfWeek = currentStart.getDay();
        const diff = currentStart.getDate() - dayOfWeek;
        currentStart = new Date(currentStart.setDate(diff));
        currentStart.setHours(0, 0, 0, 0);
        
        // Previous week
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 7);
        previousEnd = new Date(currentStart);
        previousEnd.setDate(previousEnd.getDate() - 1);
        previousEnd.setHours(23, 59, 59, 999);
        break;
        
      case "month":
        // Set to beginning of current month
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        // Previous month
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        previousEnd.setHours(23, 59, 59, 999);
        break;
        
      case "quarter":
        // Set to beginning of current quarter
        const currentQuarter = Math.floor(now.getMonth() / 3);
        currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
        // Previous quarter
        previousStart = new Date(now.getFullYear(), currentQuarter * 3 - 3, 1);
        previousEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
        previousEnd.setHours(23, 59, 59, 999);
        break;
    }
    
    // Format dates as strings for Supabase queries (YYYY-MM-DD)
    return {
      currentStart: formatDate(currentStart),
      currentEnd: formatDate(currentEnd),
      previousStart: formatDate(previousStart),
      previousEnd: formatDate(previousEnd)
    };
  };
  
  // Helper function to format dates for Supabase
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Helper function to get counts by day for sparkline
  const getDailyCounts = (
    data: { scheduled_date: string }[], 
    startDateStr: string, 
    endDateStr: string
  ) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const result: { date: string; count: number }[] = [];
    
    // Create map of dates to counts
    const countsByDate: Record<string, number> = {};
    data.forEach(item => {
      if (item.scheduled_date) {
        const dateStr = item.scheduled_date.split('T')[0];
        countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
      }
    });
    
    // Fill in all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate);
      result.push({
        date: dateStr,
        count: countsByDate[dateStr] || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  };
  
  useEffect(() => {
    fetchJobsCompletedStats(timeRange);
  }, [timeRange]);
  
  return {
    ...stats,
    timeRange,
    setTimeRange,
    refresh: () => fetchJobsCompletedStats(timeRange)
  };
};
