
import { useState, useEffect } from 'react';
import { WorkOrder, SortDirection, SortField } from '../types';

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

  // Get best available date from work order data
  const getServiceDateValue = (order: WorkOrder): Date | null => {
    // First try to use service_date if available
    if (order.service_date) {
      try {
        const date = new Date(order.service_date);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (error) {
        // If parsing fails, continue to fallbacks
      }
    }
    
    // Try to get the end date from completion data as fallback
    const endTime = order.completion_response?.orders?.[0]?.data?.endTime?.localTime;
    if (endTime) {
      try {
        const date = new Date(endTime);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (error) {
        // If date parsing fails, continue to fallback
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
            // Use our updated date extraction logic
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
              valueA = a.service_date || '';
              valueB = b.service_date || '';
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
      // Default sort if no sort criteria provided - sort by service_date descending
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
