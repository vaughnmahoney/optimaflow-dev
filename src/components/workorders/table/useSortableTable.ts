
import { useState, useEffect } from 'react';
import { WorkOrder, SortDirection, SortField } from '../types';
import { extractServiceDate, compareDates } from '@/utils/dateExtraction';

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
            // Use our unified date extraction logic
            const dateA = extractServiceDate(a);
            const dateB = extractServiceDate(b);
            
            // Use our date comparison utility with the correct sort direction
            return compareDates(dateA, dateB, sortDirection === 'asc');
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
        const dateA = extractServiceDate(a);
        const dateB = extractServiceDate(b);
        
        // Default to descending sort (newest first)
        return compareDates(dateA, dateB, false);
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
