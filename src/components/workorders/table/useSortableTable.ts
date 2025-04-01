
import { useState, useEffect } from 'react';
import { WorkOrder, SortDirection, SortField } from '../types';
import { getBestWorkOrderDate } from '@/utils/workOrderUtils';

export const useSortableTable = (
  initialWorkOrders: WorkOrder[], 
  externalSortField?: SortField, 
  externalSortDirection?: SortDirection,
  externalOnSort?: (field: SortField, direction: SortDirection) => void
) => {
  const [sortField, setSortField] = useState<SortField>(externalSortField || 'service_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>(externalSortDirection || 'desc');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);

  // Log initial work orders
  console.log(`useSortableTable initialized with ${initialWorkOrders.length} work orders`);
  console.log(`Initial sort: ${sortField} ${sortDirection}`);

  // Sync with external sort props if they change
  useEffect(() => {
    if (externalSortField !== undefined) {
      console.log(`External sort field changed to: ${externalSortField}`);
      setSortField(externalSortField);
    }
    if (externalSortDirection !== undefined) {
      console.log(`External sort direction changed to: ${externalSortDirection}`);
      setSortDirection(externalSortDirection);
    }
  }, [externalSortField, externalSortDirection]);

  // Only perform client-side sorting if we're NOT using external sorting
  // This prevents double-sorting (once on server, once on client)
  useEffect(() => {
    // If using external sort, don't client-side sort
    if (externalSortField !== undefined && externalSortDirection !== undefined) {
      console.log('Using external sorting, skipping client-side sort');
      setWorkOrders(initialWorkOrders);
      return;
    }
    
    console.log(`Client-side sorting ${initialWorkOrders.length} work orders by ${sortField} ${sortDirection}`);
    
    let sortedWorkOrders = [...initialWorkOrders];
    
    if (sortField && sortDirection) {
      if (sortField === 'service_date') {
        // Special handling for date+time sorting
        console.log('Sorting by service_date with date+time extraction logic');
        sortedWorkOrders.sort((a, b) => {
          const dateA = getBestWorkOrderDate(a);
          const dateB = getBestWorkOrderDate(b);
          
          // Log the comparison
          console.log(`Comparing dates: ${a.order_no} (${dateA ? dateA.toISOString() : 'null'}) vs ${b.order_no} (${dateB ? dateB.toISOString() : 'null'})`);
          
          // Handle null dates - null dates go to the end
          if (dateA && !dateB) return sortDirection === 'asc' ? -1 : 1;
          if (!dateA && dateB) return sortDirection === 'asc' ? 1 : -1;
          if (!dateA && !dateB) return 0;
          
          // Use timestamp comparison (getTime) to ensure both date and time are considered
          const comparison = sortDirection === 'asc' 
            ? dateA!.getTime() - dateB!.getTime()
            : dateB!.getTime() - dateA!.getTime();
            
          console.log(`  Result: ${comparison}`);
          return comparison;
        });
      } else {
        // For non-date fields
        console.log(`Sorting by ${sortField}`);
        sortedWorkOrders.sort((a, b) => {
          let valueA: any;
          let valueB: any;
          
          switch (sortField) {
            case 'order_no':
              valueA = a.order_no || '';
              valueB = b.order_no || '';
              break;
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
          
          // Log the comparison
          console.log(`Comparing ${sortField}: ${a.order_no} (${valueA}) vs ${b.order_no} (${valueB})`);
          
          // For strings, use localeCompare for proper string comparison
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
      }
    } else {
      // Default sort if no sort criteria provided - sort by service_date descending
      console.log('Using default sort: service_date desc');
      sortedWorkOrders.sort((a, b) => {
        const dateA = getBestWorkOrderDate(a);
        const dateB = getBestWorkOrderDate(b);
        
        const validA = dateA !== null;
        const validB = dateB !== null;
        
        if (validA && !validB) return -1;
        if (!validA && validB) return 1;
        if (!validA && !validB) return 0;
        
        // Use timestamp comparison to ensure both date and time are considered
        return dateB!.getTime() - dateA!.getTime();
      });
    }
    
    // Log first few and last few order numbers after sorting
    if (sortedWorkOrders.length > 0) {
      const firstFew = sortedWorkOrders.slice(0, Math.min(5, sortedWorkOrders.length))
        .map(order => order.order_no)
        .join(', ');
        
      const lastFew = sortedWorkOrders.length > 5 
        ? sortedWorkOrders.slice(-5).map(order => order.order_no).join(', ')
        : '';
        
      console.log(`First few orders after sorting: ${firstFew}`);
      if (lastFew) console.log(`Last few orders after sorting: ${lastFew}`);
    }
    
    setWorkOrders(sortedWorkOrders);
  }, [initialWorkOrders, sortField, sortDirection, externalSortField, externalSortDirection]);

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc';
    
    if (field === sortField) {
      // Toggle between asc and desc
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    console.log(`handleSort called: ${field} ${newDirection}`);
    
    setSortField(field);
    setSortDirection(newDirection);
    
    if (externalOnSort) {
      console.log(`Calling external onSort: ${field} ${newDirection}`);
      externalOnSort(field, newDirection);
    }
  };

  // Helper functions for getting display values - using safe property access
  const getLocationName = (order: WorkOrder): string => {
    if (!order.location) return 'N/A';
    
    if (typeof order.location === 'object') {
      return order.location.name || order.location.locationName || 'N/A';
    }
    
    return 'N/A';
  };

  const getDriverName = (order: WorkOrder): string => {
    if (!order.driver) return 'No Driver Assigned';
    
    if (typeof order.driver === 'object' && order.driver.name) {
      return order.driver.name;
    }
    
    return 'No Driver Name';
  };

  return {
    workOrders,
    sortField, 
    sortDirection,
    handleSort,
    getLocationName,
    getDriverName
  };
};
