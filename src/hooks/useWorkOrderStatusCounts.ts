
import { useMemo, useEffect, useState } from "react";
import { WorkOrder, WorkOrderFilters } from "@/components/workorders/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to calculate and manage work order status counts for the entire system
 * Now filtering by date range if provided
 */
export const useWorkOrderStatusCounts = (workOrders: WorkOrder[], statusFilter: string | null, filters?: WorkOrderFilters) => {
  const [statusCounts, setStatusCounts] = useState({
    approved: 0,
    pending_review: 0,
    flagged: 0,
    resolved: 0,
    rejected: 0,
    all: 0
  });

  // Fetch counts from the database considering date range
  useEffect(() => {
    const fetchFilteredCounts = async () => {
      try {
        // Prepare date filters for the query
        const dateFrom = filters?.dateRange?.from;
        const dateTo = filters?.dateRange?.to;
        
        // Start building the base query for total count
        let totalQuery = supabase
          .from("work_orders")
          .select("*", { count: 'exact', head: true });
          
        // Apply date range filter if present
        if (dateFrom) {
          totalQuery = totalQuery.gte('end_time', dateFrom.toISOString());
        }
        if (dateTo) {
          // Set time to end of day to include all orders on that day
          const endDateWithTime = new Date(dateTo);
          endDateWithTime.setHours(23, 59, 59, 999);
          totalQuery = totalQuery.lte('end_time', endDateWithTime.toISOString());
        }
        
        // Execute the count query to get total within date range
        const { count: totalCount, error: totalError } = await totalQuery;
        if (totalError) throw totalError;
        
        // Get counts by status with date range filter
        const statusQueries = [
          { 
            status: 'approved', 
            query: supabase.from("work_orders")
              .select("*", { count: 'exact', head: true })
              .eq('status', 'approved')
          },
          { 
            status: 'pending_review', 
            query: supabase.from("work_orders")
              .select("*", { count: 'exact', head: true })
              .in('status', ['pending_review', 'imported', 'pending'])
          },
          { 
            status: 'flagged', 
            query: supabase.from("work_orders")
              .select("*", { count: 'exact', head: true })
              .in('status', ['flagged', 'flagged_followup'])
          },
          { 
            status: 'resolved', 
            query: supabase.from("work_orders")
              .select("*", { count: 'exact', head: true })
              .eq('status', 'resolved')
          },
          { 
            status: 'rejected', 
            query: supabase.from("work_orders")
              .select("*", { count: 'exact', head: true })
              .eq('status', 'rejected')
          }
        ];
        
        // Apply date range filter to each status query if present
        if (dateFrom) {
          statusQueries.forEach(q => {
            q.query = q.query.gte('end_time', dateFrom.toISOString());
          });
        }
        if (dateTo) {
          const endDateWithTime = new Date(dateTo);
          endDateWithTime.setHours(23, 59, 59, 999);
          statusQueries.forEach(q => {
            q.query = q.query.lte('end_time', endDateWithTime.toISOString());
          });
        }
        
        // Execute all status queries with date range filter
        const results = await Promise.all(statusQueries.map(q => q.query));
        
        const newCounts = {
          approved: results[0].count || 0,
          pending_review: results[1].count || 0,
          flagged: results[2].count || 0,
          resolved: results[3].count || 0,
          rejected: results[4].count || 0,
          all: totalCount || 0
        };
        
        setStatusCounts(newCounts);
      } catch (error) {
        console.error("Error fetching filtered status counts:", error);
      }
    };

    fetchFilteredCounts();
  }, [filters?.dateRange?.from, filters?.dateRange?.to]);

  return statusCounts;
};
