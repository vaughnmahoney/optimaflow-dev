
import { WorkOrder, SortDirection, SortField } from "../../types";
import { getServiceDateValue } from "./dateExtractor";
import { getLocationName, getDriverName } from "./dataExtractor";
import { toLocalTime } from "@/utils/dateUtils";

/**
 * Sorts work orders based on specified field and direction
 */
export const sortWorkOrders = (
  workOrders: WorkOrder[], 
  sortField: SortField, 
  sortDirection: SortDirection
): WorkOrder[] => {
  let sortedWorkOrders = [...workOrders];
  
  if (sortField && sortDirection) {
    sortedWorkOrders.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (sortField) {
        case 'order_no':
          valueA = a.order_no || '';
          valueB = b.order_no || '';
          break;
        case 'service_date':
        case 'end_time':
          // Use our updated date extraction logic for both service_date and end_time sorting
          const dateA = getServiceDateValue(a);
          const dateB = getServiceDateValue(b);
          
          // Check if dates are valid
          const validA = dateA !== null;
          const validB = dateB !== null;
          
          // If one date is valid and the other isn't, the valid one comes first
          if (validA && !validB) return sortDirection === 'asc' ? -1 : 1;
          if (!validA && validB) return sortDirection === 'asc' ? 1 : -1;
          // If both are invalid, use alphabetical sorting on the raw strings
          if (!validA && !validB) {
            valueA = (a.end_time || a.service_date || '');
            valueB = (b.end_time || b.service_date || '');
            return sortDirection === 'asc' 
              ? valueA.localeCompare(valueB)
              : valueB.localeCompare(valueA);
          }
          
          // If both dates are valid, compare timestamps
          return sortDirection === 'asc' 
            ? dateA!.getTime() - dateB!.getTime()
            : dateB!.getTime() - dateA!.getTime();
        case 'driver':
          valueA = getDriverName(a).toLowerCase();
          valueB = getDriverName(b).toLowerCase();
          break;
        case 'location':
          valueA = getLocationName(a).toLowerCase();
          valueB = getLocationName(b).toLowerCase();
          break;
        case 'status':
          valueA = a.status || '';
          valueB = b.status || '';
          break;
        default:
          return 0;
      }
      
      // For strings, use localeCompare for proper string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // For numbers and dates (already converted to timestamps)
      return sortDirection === 'asc' 
        ? valueA - valueB 
        : valueB - valueA;
    });
  } else {
    // Default sort if no sort criteria provided - sort by end_time descending
    sortedWorkOrders.sort((a, b) => {
      const dateA = getServiceDateValue(a);
      const dateB = getServiceDateValue(b);
      
      const validA = dateA !== null;
      const validB = dateB !== null;
      
      if (validA && !validB) return -1;
      if (!validA && validB) return 1;
      if (!validA && !validB) return 0;
      
      return dateB!.getTime() - dateA!.getTime();
    });
  }
  
  return sortedWorkOrders;
};
