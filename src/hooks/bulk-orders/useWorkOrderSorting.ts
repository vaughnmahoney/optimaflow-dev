
import { WorkOrder, SortDirection, SortField } from "@/components/workorders/types";

/**
 * Sorts work orders based on the provided sort field and direction
 */
export const sortWorkOrders = (
  orders: WorkOrder[], 
  sortField: SortField, 
  sortDirection: SortDirection
): WorkOrder[] => {
  // Default sort - if no sort specified, sort by service_date descending (newest first)
  if (!sortField || !sortDirection) {
    return [...orders].sort((a, b) => {
      const dateA = a.service_date ? new Date(a.service_date) : null;
      const dateB = b.service_date ? new Date(b.service_date) : null;
      
      const validA = dateA && !isNaN(dateA.getTime());
      const validB = dateB && !isNaN(dateB.getTime());
      
      if (validA && !validB) return -1; // Valid dates come first
      if (!validA && validB) return 1;
      if (!validA && !validB) return 0;
      
      // Sort descending by default (newest first)
      return dateB!.getTime() - dateA!.getTime();
    });
  }
  
  return [...orders].sort((a, b) => {
    let valueA: any;
    let valueB: any;
    
    switch (sortField) {
      case 'order_no':
        valueA = a.order_no || '';
        valueB = b.order_no || '';
        break;
      case 'service_date':
        const dateA = a.service_date ? new Date(a.service_date) : null;
        const dateB = b.service_date ? new Date(b.service_date) : null;
        
        const validA = dateA && !isNaN(dateA.getTime());
        const validB = dateB && !isNaN(dateB.getTime());
        
        if (validA && !validB) return sortDirection === 'asc' ? -1 : 1;
        if (!validA && validB) return sortDirection === 'asc' ? 1 : -1;
        if (!validA && !validB) return 0;
        
        return sortDirection === 'asc' 
          ? dateA!.getTime() - dateB!.getTime()
          : dateB!.getTime() - dateA!.getTime();
      case 'end_time':
        const endTimeA = a.end_time ? new Date(a.end_time) : null;
        const endTimeB = b.end_time ? new Date(b.end_time) : null;
        
        const validEndA = endTimeA && !isNaN(endTimeA.getTime());
        const validEndB = endTimeB && !isNaN(endTimeB.getTime());
        
        if (validEndA && !validEndB) return sortDirection === 'asc' ? -1 : 1;
        if (!validEndA && validEndB) return sortDirection === 'asc' ? 1 : -1;
        if (!validEndA && !validEndB) {
          // Fall back to service_date if end_time is not available
          const fallbackA = a.service_date ? new Date(a.service_date) : null;
          const fallbackB = b.service_date ? new Date(b.service_date) : null;
          
          const validFallbackA = fallbackA && !isNaN(fallbackA.getTime());
          const validFallbackB = fallbackB && !isNaN(fallbackB.getTime());
          
          if (validFallbackA && !validFallbackB) return sortDirection === 'asc' ? -1 : 1;
          if (!validFallbackA && validFallbackB) return sortDirection === 'asc' ? 1 : -1;
          if (!validFallbackA && !validFallbackB) return 0;
          
          return sortDirection === 'asc'
            ? fallbackA!.getTime() - fallbackB!.getTime()
            : fallbackB!.getTime() - fallbackA!.getTime();
        }
        
        return sortDirection === 'asc'
          ? endTimeA!.getTime() - endTimeB!.getTime()
          : endTimeB!.getTime() - endTimeA!.getTime();
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
