
import { useState } from "react";
import { WorkOrderFilters } from "@/components/workorders/types";

/**
 * Hook to manage filters for bulk order adapter
 */
export const useAdapterFilters = () => {
  // Initialize with default filters matching the WorkOrderFilters type
  const [filters, setFilters] = useState<WorkOrderFilters>({
    status: null,
    dateRange: { from: null, to: null },
    driver: null,
    location: null,
    orderNo: null,
    optimoRouteStatus: null // Add this required field
  });
  
  // Filter handling functions
  const handleFiltersChange = (newFilters: WorkOrderFilters) => {
    setFilters(newFilters);
  };
  
  const handleColumnFilterChange = (column: string, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (column) {
        case 'order_no':
          newFilters.orderNo = value;
          break;
        case 'service_date':
          newFilters.dateRange = value;
          break;
        case 'driver':
          newFilters.driver = value;
          break;
        case 'location':
          newFilters.location = value;
          break;
        case 'status':
          newFilters.status = value;
          break;
        case 'optimoroute_status':
          newFilters.optimoRouteStatus = value;
          break;
      }
      
      return newFilters;
    });
  };
  
  const clearColumnFilter = (column: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (column) {
        case 'order_no':
          newFilters.orderNo = null;
          break;
        case 'service_date':
          newFilters.dateRange = { from: null, to: null };
          break;
        case 'driver':
          newFilters.driver = null;
          break;
        case 'location':
          newFilters.location = null;
          break;
        case 'status':
          newFilters.status = null;
          break;
        case 'optimoroute_status':
          newFilters.optimoRouteStatus = null;
          break;
      }
      
      return newFilters;
    });
  };
  
  const clearAllFilters = () => {
    setFilters({
      status: null,
      dateRange: { from: null, to: null },
      driver: null,
      location: null,
      orderNo: null,
      optimoRouteStatus: null // Include optimoRouteStatus in reset
    });
  };

  return {
    filters,
    setFilters: handleFiltersChange,
    onColumnFilterChange: handleColumnFilterChange,
    clearColumnFilter,
    clearAllFilters
  };
};
