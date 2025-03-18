
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
  // and use OR conditions to match on either field
  if (fromDate) {
    const fromDateStr = fromDate.toISOString().split('T')[0];
    
    // Create OR condition for date filtering across both possible date fields
    countQuery = countQuery.or(
      `and(completion_response->orders->0->data->endTime->localTime.gte.${fromDateStr},completion_response->orders->0->data->endTime->localTime.not.is.null),` +
      `and(completion_response->orders->0->data->endTime->localTime.is.null,search_response->data->date.gte.${fromDateStr})`
    );
    dataQuery = dataQuery.or(
      `and(completion_response->orders->0->data->endTime->localTime.gte.${fromDateStr},completion_response->orders->0->data->endTime->localTime.not.is.null),` +
      `and(completion_response->orders->0->data->endTime->localTime.is.null,search_response->data->date.gte.${fromDateStr})`
    );
  }
  
  if (toDate) {
    // Add a day to the end date to include that day (inclusive range)
    const inclusiveToDate = new Date(toDate);
    inclusiveToDate.setDate(inclusiveToDate.getDate() + 1);
    const toDateStr = inclusiveToDate.toISOString().split('T')[0];
    
    // Create OR condition for date filtering across both possible date fields
    countQuery = countQuery.or(
      `and(completion_response->orders->0->data->endTime->localTime.lt.${toDateStr},completion_response->orders->0->data->endTime->localTime.not.is.null),` +
      `and(completion_response->orders->0->data->endTime->localTime.is.null,search_response->data->date.lt.${toDateStr})`
    );
    dataQuery = dataQuery.or(
      `and(completion_response->orders->0->data->endTime->localTime.lt.${toDateStr},completion_response->orders->0->data->endTime->localTime.not.is.null),` +
      `and(completion_response->orders->0->data->endTime->localTime.is.null,search_response->data->date.lt.${toDateStr})`
    );
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
      // Search in the driver name field of the nested search_response JSON
      countQuery = countQuery.ilike('search_response->scheduleInformation->driverName', `%${searchValue}%`);
      dataQuery = dataQuery.ilike('search_response->scheduleInformation->driverName', `%${searchValue}%`);
    } else if (field === 'location') {
      // Search in the location name field of the nested search_response JSON
      countQuery = countQuery.or(
        `search_response->data->location->name.ilike.%${searchValue}%,` +
        `search_response->data->location->locationName.ilike.%${searchValue}%`
      );
      dataQuery = dataQuery.or(
        `search_response->data->location->name.ilike.%${searchValue}%,` +
        `search_response->data->location->locationName.ilike.%${searchValue}%`
      );
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
      // Sort by driver name
      dataQuery = dataQuery.order('search_response->scheduleInformation->driverName', { ascending: isAscending });
    }
    else if (sortField === 'location') {
      // Sort by location name
      dataQuery = dataQuery.order('search_response->data->location->name', { ascending: isAscending });
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
      nullsFirst: false // Keep nulls last when sorting newest first
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
