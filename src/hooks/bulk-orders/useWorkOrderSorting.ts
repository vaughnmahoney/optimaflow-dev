
import { WorkOrder, SortDirection, SortField } from "@/components/workorders/types";

/**
 * Sorts work orders based on the provided sort field and direction
 */
export const sortWorkOrders = (
  orders: WorkOrder[], 
  sortField: SortField, 
  sortDirection: SortDirection
): WorkOrder[] => {
  // Default sort - if no sort specified, sort by end_time descending (newest first)
  if (!sortField || !sortDirection) {
    return [...orders].sort((a, b) => {
      // First try to sort by end_time
      const endTimeA = a.end_time ? new Date(a.end_time) : null;
      const endTimeB = b.end_time ? new Date(b.end_time) : null;
      
      const validEndTimeA = endTimeA && !isNaN(endTimeA.getTime());
      const validEndTimeB = endTimeB && !isNaN(endTimeB.getTime());
      
      // If both have valid end times, compare them
      if (validEndTimeA && validEndTimeB) {
        return endTimeB.getTime() - endTimeA.getTime();
      }
      
      // If only one has valid end time, prioritize it
      if (validEndTimeA && !validEndTimeB) return -1;
      if (!validEndTimeA && validEndTimeB) return 1;
      
      // Fall back to service_date if end_time not available
      const dateA = a.service_date ? new Date(a.service_date) : null;
      const dateB = b.service_date ? new Date(b.service_date) : null;
      
      const validDateA = dateA && !isNaN(dateA.getTime());
      const validDateB = dateB && !isNaN(dateB.getTime());
      
      if (validDateA && validDateB) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // If only one has valid service_date, prioritize it
      if (validDateA && !validDateB) return -1; 
      if (!validDateA && validDateB) return 1;
      
      // Last fallback to timestamp
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
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
      case 'end_time':
        const endTimeA = a.end_time ? new Date(a.end_time) : null;
        const endTimeB = b.end_time ? new Date(b.end_time) : null;
        
        const validEndTimeA = endTimeA && !isNaN(endTimeA.getTime());
        const validEndTimeB = endTimeB && !isNaN(endTimeB.getTime());
        
        if (validEndTimeA && !validEndTimeB) return sortDirection === 'asc' ? -1 : 1;
        if (!validEndTimeA && validEndTimeB) return sortDirection === 'asc' ? 1 : -1;
        if (!validEndTimeA && !validEndTimeB) return 0;
        
        return sortDirection === 'asc' 
          ? endTimeA!.getTime() - endTimeB!.getTime()
          : endTimeB!.getTime() - endTimeA!.getTime();
      case 'service_date':
        const dateA = a.service_date ? new Date(a.service_date) : null;
        const dateB = b.service_date ? new Date(b.service_date) : null;
        
        const validDateA = dateA && !isNaN(dateA.getTime());
        const validDateB = dateB && !isNaN(dateB.getTime());
        
        if (validDateA && !validDateB) return sortDirection === 'asc' ? -1 : 1;
        if (!validDateA && validDateB) return sortDirection === 'asc' ? 1 : -1;
        if (!validDateA && !validDateB) return 0;
        
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
