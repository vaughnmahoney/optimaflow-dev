
import { WorkOrderFilters } from "../../types";

/**
 * Checks if a specific column has an active filter applied
 */
export const isColumnFiltered = (column: string, filters: WorkOrderFilters): boolean => {
  switch(column) {
    case 'order_no':
      return !!filters.orderNo;
    case 'service_date':
      return !!(filters.dateRange?.from || filters.dateRange?.to);
    case 'driver':
      return !!filters.driver;
    case 'location':
      return !!filters.location;
    case 'status':
      return !!filters.status;
    case 'optimoroute_status':
      return !!filters.optimoRouteStatus;
    default:
      return false;
  }
};
