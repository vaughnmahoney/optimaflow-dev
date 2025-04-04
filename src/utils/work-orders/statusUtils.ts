
import { WorkOrder } from "@/components/workorders/types";

/**
 * Calculate counts for each status type in the work orders array
 */
export const calculateStatusCounts = (workOrders: WorkOrder[]) => {
  const counts = {
    approved: 0,
    pending_review: 0,
    flagged: 0,
    resolved: 0,
    rejected: 0,
    all: workOrders.length
  };
  
  workOrders.forEach(workOrder => {
    const status = workOrder.status || 'pending_review';
    
    // Group flagged_followup under flagged for the counts
    const normalizedStatus = status === 'flagged_followup' ? 'flagged' : status;
    
    if (counts[normalizedStatus] !== undefined) {
      counts[normalizedStatus]++;
    }
  });
  
  return counts;
};
