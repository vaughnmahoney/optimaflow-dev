
/**
 * Work order status filter options
 */
export type WorkOrderStatus = 'approved' | 'pending_review' | 'flagged' | 'resolved' | 'rejected' | null;

/**
 * Date range object for filtering by date ranges
 */
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

/**
 * Work order filters used in queries and UI
 */
export interface WorkOrderFilters {
  status: string | null;
  dateRange: DateRange;
  driver: string | null;
  location: string | null;
  orderNo: string | null;
  optimoRouteStatus?: string | null; // Add new field for optimoroute_status filter
}

/**
 * Pagination state for work order lists
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
