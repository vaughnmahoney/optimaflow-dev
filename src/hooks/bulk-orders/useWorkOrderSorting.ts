
import { WorkOrder, SortDirection, SortField } from "@/components/workorders/types";

/**
 * Gets the work order date for sorting purposes
 * Prioritizes end_time, then service_date, then timestamp
 */
const getWorkOrderDate = (order: WorkOrder): Date | null => {
  // First try to use end_time (most reliable)
  if (order.end_time) {
    try {
      const date = new Date(order.end_time);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, continue to fallbacks
    }
  }
  
  // Then try service_date if available
  if (order.service_date) {
    try {
      const date = new Date(order.service_date);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, continue to fallback
    }
  }
  
  // Finally, fall back to timestamp if available
  if (order.timestamp) {
    try {
      const date = new Date(order.timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // If parsing fails, return null
    }
  }
  
  return null;
};

/**
 * Sorts work orders based on the provided sort field and direction
 */
export const sortWorkOrders = (
  orders: WorkOrder[], 
  sortField: SortField, 
  sortDirection: SortDirection
): WorkOrder[] => {
  // Make a copy of the array to avoid mutating the original
  const ordersCopy = [...orders];
  
  // Default sort - if no sort specified, sort by end_time descending (newest first)
  if (!sortField || !sortDirection) {
    return ordersCopy.sort((a, b) => {
      const dateA = getWorkOrderDate(a);
      const dateB = getWorkOrderDate(b);
      
      if (dateA && !dateB) return -1; // Valid dates come first
      if (!dateA && dateB) return 1;
      if (!dateA && !dateB) return 0;
      
      // Sort descending by default (newest first)
      return dateB!.getTime() - dateA!.getTime();
    });
  }
  
  return ordersCopy.sort((a, b) => {
    let valueA: any;
    let valueB: any;
    
    switch (sortField) {
      case 'order_no':
        valueA = a.order_no || '';
        valueB = b.order_no || '';
        break;
      case 'service_date':
        // Use our simplified date logic prioritizing end_time
        const dateA = getWorkOrderDate(a);
        const dateB = getWorkOrderDate(b);
        
        // Handle null dates properly
        if (dateA && !dateB) return sortDirection === 'asc' ? -1 : 1;
        if (!dateA && dateB) return sortDirection === 'asc' ? 1 : -1;
        if (!dateA && !dateB) return 0;
        
        // If both dates are valid, compare timestamps
        return sortDirection === 'asc' 
          ? dateA!.getTime() - dateB!.getTime()
          : dateB!.getTime() - dateA!.getTime();
      case 'driver':
        valueA = a.driver && typeof a.driver === 'object' && a.driver.name
          ? a.driver.name.toLowerCase() : '';
        valueB = b.driver && typeof b.driver === 'object' && b.driver.name
          ? b.driver.name.toLowerCase() : '';
        break;
      case 'location':
        valueA = a.location && typeof a.location === 'object' 
          ? (a.location.name || a.location.locationName || '').toLowerCase() : '';
        valueB = b.location && typeof b.location === 'object'
          ? (b.location.name || b.location.locationName || '').toLowerCase() : '';
        break;
      case 'status':
        valueA = a.status || '';
        valueB = b.status || '';
        break;
      default:
        return 0;
    }
    
    // For strings
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // For other values
    return sortDirection === 'asc' 
      ? valueA - valueB 
      : valueB - valueA;
  });
};

/**
 * Creates handlers for updating sort state
 */
export const useSortHandlers = (
  setSortField: React.Dispatch<React.SetStateAction<SortField>>,
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>,
  setPagination: React.Dispatch<React.SetStateAction<any>>
) => {
  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    // Reset to first page when sorting changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return { handleSort };
};
