
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderFilters, SortField, SortDirection } from "@/components/workorders/types";

/**
 * Initializes the count query for work orders
 * @returns The initialized count query
 */
export const initializeCountQuery = () => {
  return supabase
    .from("work_orders")
    .select("id", { count: "exact", head: true });
};

/**
 * Initializes the data query for work orders
 * @returns The initialized data query
 */
export const initializeDataQuery = () => {
  return supabase
    .from("work_orders")
    .select("*");
};

/**
 * Applies status filters to both count and data queries
 * @param countQuery The count query to modify
 * @param dataQuery The data query to modify
 * @param status The status filter value
 * @returns Object containing the modified queries
 */
export const applyStatusFilter = (countQuery: any, dataQuery: any, status: string | null) => {
  if (status) {
    if (status === 'flagged') {
      countQuery = countQuery.or('status.eq.flagged,status.eq.flagged_followup');
      dataQuery = dataQuery.or('status.eq.flagged,status.eq.flagged_followup');
    } else {
      countQuery = countQuery.eq('status', status);
      dataQuery = dataQuery.eq('status', status);
    }
  }
  
  return { countQuery, dataQuery };
};

/**
 * Applies order number filter to both count and data queries
 * @param countQuery The count query to modify
 * @param dataQuery The data query to modify
 * @param orderNo The order number filter value
 * @returns Object containing the modified queries
 */
export const applyOrderNoFilter = (countQuery: any, dataQuery: any, orderNo: string | null) => {
  if (orderNo) {
    countQuery = countQuery.ilike('order_no', `%${orderNo}%`);
    dataQuery = dataQuery.ilike('order_no', `%${orderNo}%`);
  }
  
  return { countQuery, dataQuery };
};

/**
 * Applies date range filters to both count and data queries using the new service_date column
 * @param countQuery The count query to modify
 * @param dataQuery The data query to modify
 * @param fromDate The start date filter
 * @param toDate The end date filter
 * @returns Object containing the modified queries
 */
export const applyDateRangeFilter = (
  countQuery: any, 
  dataQuery: any, 
  fromDate: Date | null, 
  toDate: Date | null
) => {
  try {
    // Apply date range filter using the new service_date column
    if (fromDate) {
      const fromDateStr = fromDate.toISOString().split('T')[0];
      countQuery = countQuery.gte('service_date', fromDateStr);
      dataQuery = dataQuery.gte('service_date', fromDateStr);
    }
    
    if (toDate) {
      // Add a day to the end date to include that day (inclusive range)
      const inclusiveToDate = new Date(toDate);
      inclusiveToDate.setDate(inclusiveToDate.getDate() + 1);
      const toDateStr = inclusiveToDate.toISOString().split('T')[0];
      
      countQuery = countQuery.lt('service_date', toDateStr);
      dataQuery = dataQuery.lt('service_date', toDateStr);
    }
  } catch (error) {
    console.error("Error applying date filter:", error);
  }
  
  return { countQuery, dataQuery };
};

/**
 * Applies text search filters for driver and location using the new dedicated columns
 * @param countQuery The count query to modify
 * @param dataQuery The data query to modify
 * @param searchText The search text
 * @param field The field to search in (driver or location)
 * @returns Object containing the modified queries
 */
export const applyTextSearchFilter = (
  countQuery: any, 
  dataQuery: any, 
  searchText: string | null,
  field: 'driver' | 'location'
) => {
  if (searchText && searchText.trim()) {
    const searchValue = searchText.trim().toLowerCase();
    
    try {
      if (field === 'driver') {
        // Use the new driver_name column
        countQuery = countQuery.ilike('driver_name', `%${searchValue}%`);
        dataQuery = dataQuery.ilike('driver_name', `%${searchValue}%`);
      } else if (field === 'location') {
        // Use the new location_name column
        countQuery = countQuery.ilike('location_name', `%${searchValue}%`);
        dataQuery = dataQuery.ilike('location_name', `%${searchValue}%`);
      }
    } catch (error) {
      console.error(`Error applying ${field} filter:`, error);
    }
  }
  
  return { countQuery, dataQuery };
};

/**
 * Applies sorting to the data query
 * @param dataQuery The data query to modify
 * @param sortField The field to sort by
 * @param sortDirection The direction to sort (asc or desc)
 * @returns The modified data query
 */
export const applySorting = (
  dataQuery: any, 
  sortField: SortField = 'service_date', 
  sortDirection: SortDirection = 'desc'
) => {
  if (sortField && sortDirection) {
    const isAscending = sortDirection === 'asc';
    
    if (sortField === 'order_no' || sortField === 'status') {
      // Direct column sort
      dataQuery = dataQuery.order(sortField, { ascending: isAscending });
    } 
    else if (sortField === 'service_date') {
      // Use the service_date column for sorting
      dataQuery = dataQuery.order('service_date', { ascending: isAscending });
      
      // Add timestamp as a secondary sort for consistent ordering
      dataQuery = dataQuery.order('timestamp', { ascending: isAscending });
    }
    else if (sortField === 'end_time') {
      // Use the new end_time column for sorting
      dataQuery = dataQuery.order('end_time', { ascending: isAscending });
      
      // Add service_date as a secondary sort
      dataQuery = dataQuery.order('service_date', { ascending: isAscending });
    }
    else if (sortField === 'driver') {
      // Use the driver_name column for sorting
      dataQuery = dataQuery.order('driver_name', { ascending: isAscending });
    }
    else if (sortField === 'location') {
      // Use the location_name column for sorting
      dataQuery = dataQuery.order('location_name', { ascending: isAscending });
    }
    else {
      // Default fallback to timestamp sorting
      dataQuery = dataQuery.order('timestamp', { ascending: isAscending });
    }
  } else {
    // Default sort if no criteria specified - newest first
    dataQuery = dataQuery.order('service_date', { ascending: false });
    dataQuery = dataQuery.order('timestamp', { ascending: false });
  }
  
  return dataQuery;
};

/**
 * Applies pagination to the data query
 * @param dataQuery The data query to modify
 * @param page The current page number
 * @param pageSize The number of items per page
 * @returns The modified data query
 */
export const applyPagination = (dataQuery: any, page: number = 1, pageSize: number = 10) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  return dataQuery.range(from, to);
};

/**
 * Applies all filters to the queries
 * @param filters The filter criteria
 * @param countQuery The count query to modify
 * @param dataQuery The data query to modify
 * @returns Object containing the modified queries
 */
export const applyAllFilters = (
  filters: WorkOrderFilters,
  countQuery: any,
  dataQuery: any
) => {
  // Apply status filter
  const statusFiltered = applyStatusFilter(countQuery, dataQuery, filters.status);
  countQuery = statusFiltered.countQuery;
  dataQuery = statusFiltered.dataQuery;
  
  // Apply order number filter
  const orderNoFiltered = applyOrderNoFilter(countQuery, dataQuery, filters.orderNo);
  countQuery = orderNoFiltered.countQuery;
  dataQuery = orderNoFiltered.dataQuery;
  
  // Apply date range filter
  const dateRangeFiltered = applyDateRangeFilter(
    countQuery, 
    dataQuery, 
    filters.dateRange.from, 
    filters.dateRange.to
  );
  countQuery = dateRangeFiltered.countQuery;
  dataQuery = dateRangeFiltered.dataQuery;
  
  // Apply driver filter
  const driverFiltered = applyTextSearchFilter(countQuery, dataQuery, filters.driver, 'driver');
  countQuery = driverFiltered.countQuery;
  dataQuery = driverFiltered.dataQuery;
  
  // Apply location filter
  const locationFiltered = applyTextSearchFilter(countQuery, dataQuery, filters.location, 'location');
  countQuery = locationFiltered.countQuery;
  dataQuery = locationFiltered.dataQuery;
  
  return { countQuery, dataQuery };
};
