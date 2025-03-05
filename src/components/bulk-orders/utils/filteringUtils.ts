
import { WorkOrder } from "@/components/workorders/types";

/**
 * Filter orders that have valid completion data
 * This function is now for reference only as filtering is done on the backend
 * @param orders Array of work orders
 * @returns Filtered array of work orders with valid completion
 */
export const filterCompletedOrders = (orders: WorkOrder[]): WorkOrder[] => {
  console.log("NOTICE: Backend filtering is now used instead of this function");
  // Simply return the orders since they've already been filtered on the backend
  return orders;
};
