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
 * Applies date range filters to both count and data queries
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
  // Apply date range filter using both potential date fields
  if (fromDate) {
    // Format date as YYYY-MM-DD for PostgreSQL comparison
    const fromDateStr = fromDate.toISOString().split('T')[0];
    
    // PostgreSQL JSONB path operator syntax:
    // ->'key' extracts a JSONB object
    // ->>'key' extracts a text value
    const fromDateFilter = `
      (
        search_response->'data'->>'date' >= '${fromDateStr}'
        OR
        completion_response->'orders'->0->'data'->'endTime'->>'localTime' >= '${fromDateStr}'
      )
    `;
    
    console.log(`[DEBUG] Applying FROM date filter: ${fromDateStr}`);
    console.log(`[DEBUG] SQL filter: ${fromDateFilter.replace(/\s+/g, ' ').trim()}`);
    
    countQuery = countQuery.filter(fromDateFilter, undefined, { foreignTable: null });
    dataQuery = dataQuery.filter(fromDateFilter, undefined, { foreignTable: null });
  }
  
  if (toDate) {
    // Add a day to the end date to include that day (inclusive range)
    const inclusiveToDate = new Date(toDate);
    inclusiveToDate.setDate(inclusiveToDate.getDate() + 1);
    const toDateStr = inclusiveToDate.toISOString().split('T')[0];
    
    // PostgreSQL JSONB path operator syntax:
    // ->'key' extracts a JSONB object
    // ->>'key' extracts a text value
    const toDateFilter = `
      (
        search_response->'data'->>'date' < '${toDateStr}'
        OR
        completion_response->'orders'->0->'data'->'endTime'->>'localTime' < '${toDateStr}'
      )
    `;
    
    console.log(`[DEBUG] Applying TO date filter: ${toDateStr}`);
    console.log(`[DEBUG] SQL filter: ${toDateFilter.replace(/\s+/g, ' ').trim()}`);
    
    countQuery = countQuery.filter(toDateFilter, undefined, { foreignTable: null });
    dataQuery = dataQuery.filter(toDateFilter, undefined, { foreignTable: null });
  }
  
  return { countQuery, dataQuery };
};

/**
 * Applies text search filters for driver and location
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
    
    if (field === 'driver') {
      // PostgreSQL JSONB path operator syntax for driver name
      const driverFilter = `
        search_response->'scheduleInformation'->>'driverName' ILIKE '%${searchValue}%'
      `;
      
      console.log(`[DEBUG] Applying DRIVER filter: "${searchValue}"`);
      console.log(`[DEBUG] SQL filter: ${driverFilter.replace(/\s+/g, ' ').trim()}`);
      
      countQuery = countQuery.filter(driverFilter, undefined, { foreignTable: null });
      dataQuery = dataQuery.filter(driverFilter, undefined, { foreignTable: null });
    } else if (field === 'location') {
      // For location, we need to check multiple possible paths in the JSONB
      const locationFilter = `
        (
          search_response->'data'->'location'->>'name' ILIKE '%${searchValue}%'
          OR
          search_response->'data'->'location'->>'locationName' ILIKE '%${searchValue}%'
          OR
          search_response->'data'->'location'->>'address' ILIKE '%${searchValue}%'
        )
      `;
      
      console.log(`[DEBUG] Applying LOCATION filter: "${searchValue}"`);
      console.log(`[DEBUG] SQL filter: ${locationFilter.replace(/\s+/g, ' ').trim()}`);
      
      countQuery = countQuery.filter(locationFilter, undefined, { foreignTable: null });
      dataQuery = dataQuery.filter(locationFilter, undefined, { foreignTable: null });
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
      // For service_date, apply a multi-level sorting approach using the actual paths in the database
      // First try to sort by completion time if available
      dataQuery = dataQuery.order('completion_response->orders->0->data->endTime->localTime', { 
        ascending: isAscending,
        nullsFirst: !isAscending // Put nulls last when sorting desc (newest first)
      });
      
      // Then try the search_response date as backup
      dataQuery = dataQuery.order('search_response->data->date', { 
        ascending: isAscending,
        nullsFirst: !isAscending
      });
      
      // Add a final fallback sort using timestamp for consistent ordering
      dataQuery = dataQuery.order('timestamp', { ascending: isAscending });
    }
    else if (sortField === 'driver') {
      // Sort by driver name using the correct JSONB path
      dataQuery = dataQuery.order('search_response->scheduleInformation->driverName', { 
        ascending: isAscending,
        nullsFirst: !isAscending
      });
    }
    else if (sortField === 'location') {
      // Sort by location name using the correct JSONB path
      dataQuery = dataQuery.order('search_response->data->location->name', { 
        ascending: isAscending,
        nullsFirst: !isAscending
      });
    }
    else {
      // Default fallback to timestamp sorting
      dataQuery = dataQuery.order('timestamp', { ascending: isAscending });
    }
  } else {
    // Default sort if no criteria specified - newest first
    // Apply the same multi-level sorting as above but with fixed direction
    dataQuery = dataQuery.order('completion_response->orders->0->data->endTime->localTime', { 
      ascending: false,
      nullsFirst: false
    });
    
    dataQuery = dataQuery.order('search_response->data->date', { 
      ascending: false,
      nullsFirst: false
    });
    
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
  const statusResult = applyStatusFilter(countQuery, dataQuery, filters.status);
  countQuery = statusResult.countQuery;
  dataQuery = statusResult.dataQuery;
  
  // Apply order number filter
  const orderNoResult = applyOrderNoFilter(countQuery, dataQuery, filters.orderNo);
  countQuery = orderNoResult.countQuery;
  dataQuery = orderNoResult.dataQuery;
  
  // Apply date range filter
  const dateRangeResult = applyDateRangeFilter(
    countQuery, 
    dataQuery, 
    filters.dateRange?.from || null, 
    filters.dateRange?.to || null
  );
  countQuery = dateRangeResult.countQuery;
  dataQuery = dateRangeResult.dataQuery;
  
  // Apply driver filter
  const driverResult = applyTextSearchFilter(countQuery, dataQuery, filters.driver, 'driver');
  countQuery = driverResult.countQuery;
  dataQuery = driverResult.dataQuery;
  
  // Apply location filter
  const locationResult = applyTextSearchFilter(countQuery, dataQuery, filters.location, 'location');
  countQuery = locationResult.countQuery;
  dataQuery = locationResult.dataQuery;
  
  return { countQuery, dataQuery };
};
