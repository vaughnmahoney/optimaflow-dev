
import { useState, useEffect } from 'react';
import { WorkOrder, SortDirection, SortField } from '../types';
import { sortWorkOrders } from './utils/sortingLogic';
import { getLocationName, getDriverName } from './utils/dataExtractor';

/**
 * Hook for sorting work order data in tables
 */
export const useSortableTable = (
  initialWorkOrders: WorkOrder[], 
  externalSortField?: SortField, 
  externalSortDirection?: SortDirection,
  externalOnSort?: (field: SortField, direction: SortDirection) => void
) => {
  const [sortField, setSortField] = useState<SortField>(externalSortField || 'end_time');
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
    
    // Use the extracted sorting logic
    const sortedWorkOrders = sortWorkOrders(initialWorkOrders, sortField, sortDirection);
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

  return {
    workOrders,
    sortField, 
    sortDirection,
    handleSort,
    getLocationName,
    getDriverName
  };
};
