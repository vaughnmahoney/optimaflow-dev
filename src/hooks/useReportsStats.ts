
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StatusCategory {
  name: string;
  value: number;
  color: string;
}

export interface TechnicianMetric {
  name: string;
  jobCount: number;
  avgDuration?: number; // in minutes
}

export interface TimeMetric {
  category: string;
  avgDuration: number; // in minutes
  count: number;
}

export interface ReportStats {
  statusCategories: StatusCategory[];
  technicianPerformance: TechnicianMetric[];
  customerGroupMetrics: TimeMetric[];
  total: number;
  avgServiceDuration: number; // in minutes
  isLoading: boolean;
}

export const useReportsStats = () => {
  const [stats, setStats] = useState<ReportStats>({
    statusCategories: [],
    technicianPerformance: [],
    customerGroupMetrics: [],
    total: 0,
    avgServiceDuration: 0,
    isLoading: true
  });

  const fetchReportStats = async () => {
    setStats(prev => ({ ...prev, isLoading: true }));
    
    try {
      let allReports: any[] = [];
      let page = 0;
      const pageSize = 1000; // Use 1000 which is Supabase's limit
      let hasMore = true;
      
      // Paginate through all results to get everything
      while (hasMore) {
        console.log(`Fetching reports page ${page + 1}`);
        
        const { data, error } = await supabase
          .from('reports')
          .select('optimoroute_status, scheduled_time, end_time, tech_name, cust_group')
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          allReports = [...allReports, ...data];
          console.log(`Received ${data.length} records in page ${page + 1}, total so far: ${allReports.length}`);
          
          // If we got exactly the page size, there might be more data
          if (data.length === pageSize) {
            page++;
            hasMore = true;
          } else {
            // If we got less than the page size, we've reached the end
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      
      console.log(`Total reports fetched: ${allReports.length}`);
      
      // Count statuses by category
      const statusCounts = {
        completed: 0,  // success
        failed: 0,     // failed, rejected
        scheduled: 0   // scheduled, servicing, on_route, planned
      };
      
      // Calculate service durations and collect metrics by technician and customer group
      const techMetrics: { [key: string]: { jobCount: number, totalDuration: number } } = {};
      const custGroupMetrics: { [key: string]: { jobCount: number, totalDuration: number } } = {};
      let totalDuration = 0;
      let durationCount = 0;
      
      allReports.forEach(report => {
        const status = report.optimoroute_status?.toLowerCase() || 'unknown';
        
        // Process status counts
        if (status === 'success') {
          statusCounts.completed++;
        } else if (status === 'failed' || status === 'rejected') {
          statusCounts.failed++;
        } else if (['scheduled', 'servicing', 'on_route', 'planned'].includes(status)) {
          statusCounts.scheduled++;
        }
        
        // Process service durations when we have both timestamps
        if (report.scheduled_time && report.end_time) {
          const startTime = new Date(report.scheduled_time);
          const endTime = new Date(report.end_time);
          
          // Only calculate if both dates are valid
          if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
            const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            
            // Only count positive durations that are reasonably within service time (less than 24 hours)
            if (durationMinutes > 0 && durationMinutes < 24 * 60) {
              totalDuration += durationMinutes;
              durationCount++;
              
              // Group by technician
              if (report.tech_name) {
                if (!techMetrics[report.tech_name]) {
                  techMetrics[report.tech_name] = { jobCount: 0, totalDuration: 0 };
                }
                techMetrics[report.tech_name].jobCount++;
                techMetrics[report.tech_name].totalDuration += durationMinutes;
              }
              
              // Group by customer group
              if (report.cust_group) {
                if (!custGroupMetrics[report.cust_group]) {
                  custGroupMetrics[report.cust_group] = { jobCount: 0, totalDuration: 0 };
                }
                custGroupMetrics[report.cust_group].jobCount++;
                custGroupMetrics[report.cust_group].totalDuration += durationMinutes;
              }
            }
          }
        }
      });
      
      const total = Object.values(statusCounts).reduce((acc, val) => acc + val, 0);
      
      // Format data for charts and analysis
      
      // 1. Status distribution
      const statusCategories: StatusCategory[] = [
        { name: 'Completed', value: statusCounts.completed, color: '#4ade80' },  // green
        { name: 'Failed/Rejected', value: statusCounts.failed, color: '#f87171' }, // red
        { name: 'Scheduled', value: statusCounts.scheduled, color: '#60a5fa' }   // blue
      ];
      
      // 2. Technician performance
      const technicianPerformance: TechnicianMetric[] = Object.entries(techMetrics)
        .map(([name, metrics]) => ({
          name,
          jobCount: metrics.jobCount,
          avgDuration: metrics.jobCount > 0 ? Math.round(metrics.totalDuration / metrics.jobCount) : undefined
        }))
        .sort((a, b) => b.jobCount - a.jobCount) // Sort by job count
        .slice(0, 10); // Top 10 technicians
      
      // 3. Customer group metrics
      const customerGroupMetrics: TimeMetric[] = Object.entries(custGroupMetrics)
        .map(([category, metrics]) => ({
          category,
          avgDuration: metrics.jobCount > 0 ? Math.round(metrics.totalDuration / metrics.jobCount) : 0,
          count: metrics.jobCount
        }))
        .sort((a, b) => b.count - a.count) // Sort by job count
        .slice(0, 5); // Top 5 customer groups
      
      // Calculate overall average service duration
      const avgServiceDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;
      
      setStats({
        statusCategories,
        technicianPerformance,
        customerGroupMetrics,
        total,
        avgServiceDuration,
        isLoading: false
      });
      
    } catch (error) {
      console.error("Error fetching report stats:", error);
      toast.error("Failed to load report statistics");
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  useEffect(() => {
    fetchReportStats();
  }, []);
  
  return {
    ...stats,
    refresh: fetchReportStats
  };
};
