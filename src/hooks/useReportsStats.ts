
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
      // Query without any limit to get all reports
      const { data, error } = await supabase
        .from('reports')
        .select('optimoroute_status');
      
      if (error) {
        throw error;
      }
      
      // Count statuses by category
      const statusCounts = {
        completed: 0,  // success
        failed: 0,     // failed, rejected
        scheduled: 0   // scheduled, servicing, on_route, planned
      };
      
      data.forEach(report => {
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
