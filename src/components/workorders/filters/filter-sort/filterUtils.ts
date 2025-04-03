
import { WorkOrderFilters } from "../../types";

// Helper function to count active filters
export const countActiveFilters = (filters: WorkOrderFilters): number => {
  let count = 0;
  if (filters.status) count++;
  if (filters.orderNo) count++;
  if (filters.driver) count++;
  if (filters.location) count++;
  if (filters.dateRange.from || filters.dateRange.to) count++;
  if (filters.optimoRouteStatus) count++;
  return count;
};

export const checkHasActiveFilters = (filters: WorkOrderFilters): boolean => {
  return (
    filters.status !== null || 
    filters.orderNo !== null || 
    filters.driver !== null || 
    filters.location !== null || 
    filters.dateRange.from !== null || 
    filters.dateRange.to !== null ||
    filters.optimoRouteStatus !== null
  );
};
