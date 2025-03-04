
import { useState, useEffect } from "react";
import { BulkOrdersResponse } from "@/components/bulk-orders/types";
import { WorkOrder } from "@/components/workorders/types";
import { transformBulkOrderToWorkOrder } from "@/components/bulk-orders/utils/transformBulkOrderData";

/**
 * Transforms bulk orders API response to WorkOrder format
 */
export const useOrdersTransformer = (response: BulkOrdersResponse | null) => {
  const [transformedOrders, setTransformedOrders] = useState<WorkOrder[]>([]);

  // Effect to transform orders when response changes
  useEffect(() => {
    if (response && response.orders && response.orders.length > 0) {
      const workOrders = response.orders.map(transformBulkOrderToWorkOrder);
      setTransformedOrders(workOrders);
    } else {
      setTransformedOrders([]);
    }
  }, [response]);

  return { transformedOrders };
};
