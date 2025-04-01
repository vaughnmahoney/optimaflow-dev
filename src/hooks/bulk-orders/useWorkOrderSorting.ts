
import { WorkOrder, SortDirection, SortField } from "@/components/workorders/types";
import { getBestWorkOrderDate } from "@/utils/workOrderUtils";

/**
 * Sorts work orders based on the provided sort field and direction
 * Ensures proper date+time comparison for consistent sorting
 */
export const sortWorkOrders = (
  orders: WorkOrder[], 
  sortField: SortField, 
  sortDirection: SortDirection
): WorkOrder[] => {
  // Create a copy of orders to avoid mutating the original
  const ordersToSort = [...orders];
  
  console.log(`Sorting ${orders.length} work orders by ${sortField} ${sortDirection}`);
  
  // Default sort - if no sort specified, sort by service_date descending (newest first)
  if (!sortField || !sortDirection) {
    console.log('Using default sort: service_date desc');
    return ordersToSort.sort((a, b) => {
      const dateA = getBestWorkOrderDate(a);
      const dateB = getBestWorkOrderDate(b);
      
      // Log the comparison values
      console.log(`Default sort comparing: ${a.order_no} (${dateA ? dateA.toISOString() : 'null'}) vs ${b.order_no} (${dateB ? dateB.toISOString() : 'null'})`);
      
      // Handle null dates - null dates go to the end
      if (dateA && !dateB) return -1; // Valid dates come first
      if (!dateA && dateB) return 1;
      if (!dateA && !dateB) return 0;
      
      // Sort descending by default (newest first) using timestamp comparison
      // This ensures both date and time are considered
      return dateB!.getTime() - dateA!.getTime();
    });
  }
  
  // Order IDs for logging
  const orderIds = ordersToSort.map(o => o.order_no).join(", ");
  console.log(`Orders before sorting: ${orderIds}`);
  
  const result = ordersToSort.sort((a, b) => {
    // For 'service_date' field, use our special date+time extraction logic
    if (sortField === 'service_date') {
      const dateA = getBestWorkOrderDate(a);
      const dateB = getBestWorkOrderDate(b);
      
      // Log the comparison values
      console.log(`Comparing dates: ${a.order_no} (${dateA ? dateA.toISOString() : 'null'}) vs ${b.order_no} (${dateB ? dateB.toISOString() : 'null'})`);
      
      // Handle null dates - null dates go to the end
      if (dateA && !dateB) return sortDirection === 'asc' ? -1 : 1;
      if (!dateA && dateB) return sortDirection === 'asc' ? 1 : -1;
      if (!dateA && !dateB) return 0;
      
      // Use getTime() to compare timestamps, ensuring both date and time are considered
      const comparison = sortDirection === 'asc' 
        ? dateA!.getTime() - dateB!.getTime()
        : dateB!.getTime() - dateA!.getTime();
      
      console.log(`  Result: ${comparison}`);
      return comparison;
    }
    
    // For other fields, use regular string/value comparison
    let valueA: any;
    let valueB: any;
    
    switch (sortField) {
      case 'order_no':
        valueA = a.order_no || '';
        valueB = b.order_no || '';
        break;
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
    
    // Log the comparison values
    console.log(`Comparing ${sortField}: ${a.order_no} (${valueA}) vs ${b.order_no} (${valueB})`);
    
    // For strings
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      const comparison = sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
      
      console.log(`  Result: ${comparison}`);
      return comparison;
    }
    
    // For other values
    const comparison = sortDirection === 'asc' 
      ? valueA - valueB 
      : valueB - valueA;
    
    console.log(`  Result: ${comparison}`);
    return comparison;
  });
  
  // Log the sorted order IDs
  const sortedOrderIds = result.map(o => o.order_no).join(", ");
  console.log(`Orders after sorting: ${sortedOrderIds}`);
  
  return result;
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
    console.log(`Setting sort: ${field} ${direction}`);
    setSortField(field);
    setSortDirection(direction);
    // Reset to first page when sorting changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return { handleSort };
};
