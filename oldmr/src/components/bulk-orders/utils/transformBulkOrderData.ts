
import { WorkOrder } from "@/components/workorders/types";
import { transformOrder } from "./orderTransformer";

/**
 * Transforms the bulk orders API response into the WorkOrder type structure
 * @param order The order data from the bulk orders API
 * @returns A formatted WorkOrder object
 */
export const transformBulkOrderToWorkOrder = (order: any): WorkOrder => {
  // We now use our new transformation utility for more consistent results
  return transformOrder(order);
};
