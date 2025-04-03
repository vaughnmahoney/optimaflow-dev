
import { WorkOrderFilters, SortField, SortDirection } from "@/components/workorders/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Initialize the base query for counting work orders
 */
export const initializeCountQuery = () => {
  return supabase
    .from('work_orders')
    .select('*', { count: 'exact', head: true });
};

/**
 * Initialize the base query for fetching work order data
 */
export const initializeDataQuery = () => {
  return supabase
    .from('work_orders')
    .select('*');
};

/**
 * Apply all filters to both count and data queries
 */
export const applyAllFilters = (filters: WorkOrderFilters, countQuery: any, dataQuery: any) => {
  // Apply status filter
  if (filters.status) {
    countQuery = countQuery.eq('status', filters.status);
    dataQuery = dataQuery.eq('status', filters.status);
  }
  
  // Apply date range filter
  if (filters.dateRange) {
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      countQuery = countQuery.gte('end_time', fromDate.toISOString());
      dataQuery = dataQuery.gte('end_time', fromDate.toISOString());
    }
    
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      // Set the time to the end of day to include all orders on that day
      toDate.setHours(23, 59, 59, 999);
      countQuery = countQuery.lte('end_time', toDate.toISOString());
      dataQuery = dataQuery.lte('end_time', toDate.toISOString());
    }
  }
  
  // Apply order number filter
  if (filters.orderNo) {
    countQuery = countQuery.ilike('order_no', `%${filters.orderNo}%`);
    dataQuery = dataQuery.ilike('order_no', `%${filters.orderNo}%`);
  }
  
  // Apply driver filter
  if (filters.driver) {
    countQuery = countQuery.ilike('driver_name', `%${filters.driver}%`);
    dataQuery = dataQuery.ilike('driver_name', `%${filters.driver}%`);
  }
  
  // Apply location filter
  if (filters.location) {
    countQuery = countQuery.ilike('location_name', `%${filters.location}%`);
    dataQuery = dataQuery.ilike('location_name', `%${filters.location}%`);
  }

  // Apply optimoroute_status filter if present
  if (filters.optimoRouteStatus) {
    countQuery = countQuery.eq('optimoroute_status', filters.optimoRouteStatus);
    dataQuery = dataQuery.eq('optimoroute_status', filters.optimoRouteStatus);
  }
  
  return { countQuery, dataQuery };
};

/**
 * Apply sorting to the data query
 */
export const applySorting = (dataQuery: any, sortField: SortField, sortDirection: SortDirection) => {
  // Special handling for certain fields that need JSONB access
  if (sortField === 'driver') {
    return dataQuery.order('driver_name', { ascending: sortDirection === 'asc' });
  } else if (sortField === 'location') {
    return dataQuery.order('location_name', { ascending: sortDirection === 'asc' });
  } else if (sortField === 'optimoroute_status') {
    // Use the new optimoroute_status field for sorting
    return dataQuery.order('optimoroute_status', { ascending: sortDirection === 'asc' });
  } else {
    return dataQuery.order(sortField, { ascending: sortDirection === 'asc' });
  }
};

/**
 * Apply pagination to the data query
 */
export const applyPagination = (dataQuery: any, page: number, pageSize: number) => {
  const start = (page - 1) * pageSize;
  return dataQuery.range(start, start + pageSize - 1);
};
