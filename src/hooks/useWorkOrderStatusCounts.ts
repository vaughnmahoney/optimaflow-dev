
import { useMemo, useEffect, useState } from "react";
import { WorkOrder } from "@/components/workorders/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to calculate and manage work order status counts for the entire system
 */
export const useWorkOrderStatusCounts = (workOrders: WorkOrder[], statusFilter: string | null) => {
  const [statusCounts, setStatusCounts] = useState({
    approved: 0,
    pending_review: 0,
    flagged: 0,
    resolved: 0,
    rejected: 0,
    all: 0
  });

  // Fetch global counts from the database
  useEffect(() => {
    const fetchGlobalCounts = async () => {
      try {
        // Get count of all work orders
        const { count: totalCount, error: totalError } = await supabase
          .from("work_orders")
          .select("*", { count: 'exact', head: true });

        if (totalError) throw totalError;
        
        // Get counts by status
        const statusQueries = [
          { status: 'approved', query: supabase.from("work_orders").select("*", { count: 'exact', head: true }).eq('status', 'approved') },
          { status: 'pending_review', query: supabase.from("work_orders").select("*", { count: 'exact', head: true }).in('status', ['pending_review', 'imported', 'pending']) },
          { status: 'flagged', query: supabase.from("work_orders").select("*", { count: 'exact', head: true }).in('status', ['flagged', 'flagged_followup']) },
          { status: 'resolved', query: supabase.from("work_orders").select("*", { count: 'exact', head: true }).eq('status', 'resolved') },
          { status: 'rejected', query: supabase.from("work_orders").select("*", { count: 'exact', head: true }).eq('status', 'rejected') }
        ];
        
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
        console.error("Error fetching status counts:", error);
      }
    };

    fetchGlobalCounts();
  }, []);

  return statusCounts;
};
