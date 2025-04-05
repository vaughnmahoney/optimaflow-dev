import { WorkOrderFilters } from "../../types";

// Helper function to count active filters
export const countActiveFilters = (filters: WorkOrderFilters): number => {
  let count = 0;
  if (filters.status) count++;
  if (filters.orderNo) count++;
  if (filters.driver) count++;
  if (filters.location) count++;
  // Date range is excluded from the count
  if (filters.optimoRouteStatus) count++;
  return count;
};

export const checkHasActiveFilters = (filters: WorkOrderFilters, includeDateRange: boolean = true): boolean => {
  const hasNonDateFilters = 
    filters.status !== null || 
    filters.orderNo !== null || 
    filters.driver !== null || 
    filters.location !== null ||
    filters.optimoRouteStatus !== null;
    
  // If we have non-date filters, return true immediately
  if (hasNonDateFilters) return true;
  
  // Otherwise, check date range only if we're including it in our check
  return includeDateRange && (filters.dateRange.from !== null || filters.dateRange.to !== null);
};
