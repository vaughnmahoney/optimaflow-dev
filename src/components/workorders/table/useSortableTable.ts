
import { useState, useEffect } from 'react';
import { WorkOrder, SortDirection, SortField } from '../types';

export const useSortableTable = (
  initialWorkOrders: WorkOrder[], 
  externalSortField?: SortField, 
  externalSortDirection?: SortDirection,
  externalOnSort?: (field: SortField, direction: SortDirection) => void
) => {
  const [sortField, setSortField] = useState<SortField>(externalSortField || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(externalSortDirection || null);
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

  // Sort the work orders when sort criteria or data changes
  useEffect(() => {
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
            valueA = a.service_date ? new Date(a.service_date).getTime() : 0;
            valueB = b.service_date ? new Date(b.service_date).getTime() : 0;
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
    }
    
    setWorkOrders(sortedWorkOrders);
  }, [initialWorkOrders, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = null;
    
    if (field === sortField) {
      // Cycle through: null -> asc -> desc -> null
      if (sortDirection === null) newDirection = 'asc';
      else if (sortDirection === 'asc') newDirection = 'desc';
      else newDirection = null;
    } else {
      // New field, start with ascending
      newDirection = 'asc';
    }
    
    setSortField(newDirection === null ? null : field);
    setSortDirection(newDirection);
    
    if (externalOnSort) {
      externalOnSort(newDirection === null ? null : field, newDirection);
    }
  };

  // Helper functions for getting display values
  const getLocationName = (order: WorkOrder): string => {
    if (!order.location) return 'N/A';
    return order.location.name || order.location.locationName || 'N/A';
  };

  const getDriverName = (order: WorkOrder): string => {
    if (!order.driver) return 'No Driver Assigned';
    return order.driver.name || 'No Driver Name';
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
