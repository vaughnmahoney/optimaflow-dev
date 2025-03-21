import { useState, useEffect } from "react";
import { WorkOrder, SortDirection, SortField } from "../types";

interface UseSortableTableProps {
  workOrders: WorkOrder[];
  externalSortField?: SortField;
  externalSortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
}

/**
 * Hook for handling table sorting with server-side pagination support
 * This is now a pass-through for server-side sorting state
 */
export const useSortableTable = ({
  workOrders,
  externalSortField,
  externalSortDirection,
  onSort
}: UseSortableTableProps) => {
  // These local states are only used if external state is not provided
  const [sortField, setSortField] = useState<SortField>(externalSortField || 'service_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>(externalSortDirection || 'desc');

  // Sync with external sort props if they change
  useEffect(() => {
    if (externalSortField !== undefined) {
      setSortField(externalSortField);
    }
  }, [externalSortField]);

  useEffect(() => {
    if (externalSortDirection !== undefined) {
      setSortDirection(externalSortDirection);
    }
  }, [externalSortDirection]);

  // Handle sort toggle - now just passes the request to the parent
  const handleSort = (field: SortField) => {
    let direction: SortDirection = 'asc';
    
    // If already sorting by this field, toggle direction
    if (field === sortField) {
      direction = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc';
    }
    
    // Update local state if not controlled externally
    if (externalSortField === undefined) {
      setSortField(field);
    }
    
    if (externalSortDirection === undefined) {
      setSortDirection(direction);
    }
    
    // Call the external handler if provided
    if (onSort) {
      onSort(field, direction);
    }
  };

  // Utility functions for extracting location and driver names
  // These are kept for backward compatibility with any components that might use them
  const getLocationName = (workOrder: WorkOrder): string => {
    // Try to get location name from various possible sources
    if (workOrder.location?.name) {
      return workOrder.location.name;
    }
    
    if (workOrder.location?.locationName) {
      return workOrder.location.locationName;
    }
    
    if (workOrder.search_response?.data?.location?.name) {
      return workOrder.search_response.data.location.name;
    }
    
    if (workOrder.search_response?.data?.location?.locationName) {
      return workOrder.search_response.data.location.locationName;
    }
    
    // Return address if name not available
    if (workOrder.location?.address) {
      return workOrder.location.address;
    }
    
    return 'Unknown Location';
  };

  const getDriverName = (workOrder: WorkOrder): string => {
    // Try to get driver name from various possible sources
    if (workOrder.driver?.name) {
      return workOrder.driver.name;
    }
    
    if (workOrder.search_response?.scheduleInformation?.driverName) {
      return workOrder.search_response.scheduleInformation.driverName;
    }
    
    return 'Unassigned';
  };

  return {
    sortedWorkOrders: workOrders, // No client-side sorting, just return the original array
    sortField,
    sortDirection,
    handleSort,
    getLocationName,
    getDriverName
  };
};
