
import { useMemo } from "react";
import { WorkOrder } from "@/components/workorders/types";
import { supabase } from "@/integrations/supabase/client";
import { calculateStatusCounts } from "@/utils/workOrderUtils";

/**
 * Hook to calculate and manage work order status counts
 */
export const useWorkOrderStatusCounts = (workOrders: WorkOrder[], statusFilter: string | null) => {
  const statusCounts = useMemo(() => {
    const counts = calculateStatusCounts(workOrders);
    
    // If we're filtering, fetch accurate counts from the database
    if (statusFilter) {
      const fetchStatusCounts = async () => {
        const { data, error } = await supabase
          .from("work_orders")
          .select("status");
        
        if (!error && data) {
          const dbCounts = {
            approved: 0,
            pending_review: 0,
            flagged: 0,
            resolved: 0,
            rejected: 0,
            all: 0
          };
          
          data.forEach(order => {
            const status = order.status || 'pending_review';
            // Group flagged_followup under flagged for the counts
            const normalizedStatus = status === 'flagged_followup' ? 'flagged' : status;
            
            if (dbCounts[normalizedStatus] !== undefined) {
              dbCounts[normalizedStatus]++;
            }
            dbCounts.all = (dbCounts.all || 0) + 1;
          });
          
          return dbCounts;
        }
        
        return counts;
      };
      
      fetchStatusCounts().then(newCounts => {
        Object.keys(counts).forEach(key => {
          counts[key] = newCounts[key] || 0;
        });
      });
    }
    
    return counts;
  }, [workOrders, statusFilter]);

  return statusCounts;
};
