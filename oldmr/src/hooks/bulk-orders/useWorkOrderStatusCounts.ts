
import { WorkOrder } from "@/components/workorders/types";

/**
 * Calculates the count of work orders by status
 */
export const calculateStatusCounts = (orders: WorkOrder[]) => {
  return {
    approved: orders.filter(order => order.status === 'approved').length,
    pending_review: orders.filter(order => order.status === 'pending_review' || order.status === 'imported').length,
    flagged: orders.filter(order => order.status === 'flagged' || order.status === 'flagged_followup').length,
    all: orders.length
  };
};
