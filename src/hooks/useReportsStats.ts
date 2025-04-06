
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StatusCategory {
  name: string;
  value: number;
  color: string;
}

export interface ReportStats {
  statusCategories: StatusCategory[];
  total: number;
  isLoading: boolean;
}

export const useReportsStats = () => {
  const [stats, setStats] = useState<ReportStats>({
    statusCategories: [],
    total: 0,
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
          .select('optimoroute_status')
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
      
      allReports.forEach(report => {
        const status = report.optimoroute_status?.toLowerCase() || 'unknown';
        
        if (status === 'success') {
          statusCounts.completed++;
        } else if (status === 'failed' || status === 'rejected') {
          statusCounts.failed++;
        } else if (['scheduled', 'servicing', 'on_route', 'planned'].includes(status)) {
          statusCounts.scheduled++;
        }
        // Unknown statuses are not counted
      });
      
      const total = Object.values(statusCounts).reduce((acc, val) => acc + val, 0);
      
      // Format for chart display
      const statusCategories: StatusCategory[] = [
        { name: 'Completed', value: statusCounts.completed, color: '#4ade80' },  // green
        { name: 'Failed/Rejected', value: statusCounts.failed, color: '#f87171' }, // red
        { name: 'Scheduled', value: statusCounts.scheduled, color: '#60a5fa' }   // blue
      ];
      
      setStats({
        statusCategories,
        total,
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
