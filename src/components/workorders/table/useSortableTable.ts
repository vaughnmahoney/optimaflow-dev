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

  // Sync with external sort props if they change
  useEffect(() => {
    if (externalSortField !== undefined) {
      setSortField(externalSortField);
    }
    if (externalSortDirection !== undefined) {
      setSortDirection(externalSortDirection);
    }
  }, [externalSortField, externalSortDirection]);

  // Only perform client-side sorting if we're NOT using external sorting
  // This prevents double-sorting (once on server, once on client)
  useEffect(() => {
    // If using external sort, don't client-side sort
    if (externalSortField !== undefined && externalSortDirection !== undefined) {
      setWorkOrders(initialWorkOrders);
      return;
    }
    
    let sortedWorkOrders = [...initialWorkOrders];
    
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
            // Use our shared date extraction logic
            const dateA = getBestWorkOrderDate(a);
            const dateB = getBestWorkOrderDate(b);
            
            // Handle null dates - null dates go to the end
            if (dateA && !dateB) return sortDirection === 'asc' ? -1 : 1;
            if (!dateA && dateB) return sortDirection === 'asc' ? 1 : -1;
            if (!dateA && !dateB) return 0;
            
            // Use timestamp comparison (getTime) to ensure both date and time are considered
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
      // Default sort if no sort criteria provided - sort by service_date descending
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
    
    setWorkOrders(sortedWorkOrders);
  }, [initialWorkOrders, sortField, sortDirection, externalSortField, externalSortDirection]);

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc';
    
    if (field === sortField) {
      // Toggle between asc and desc
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    setSortField(field);
    setSortDirection(newDirection);
    
    if (externalOnSort) {
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
