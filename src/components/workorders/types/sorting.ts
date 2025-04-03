
/**
 * Fields available for sorting work orders
 */
export type SortField = 
  | 'order_no'
  | 'service_date'
  | 'end_time'
  | 'status'
  | 'driver'
  | 'location'
  | 'optimoroute_status'; // Added this field to the allowed sort fields

/**
 * Available sort directions for work order list
 */
export type SortDirection = 'asc' | 'desc';
