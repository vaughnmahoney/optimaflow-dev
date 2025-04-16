
import { WorkOrder, WorkOrderFilters } from "@/components/workorders/types";

/**
 * Applies filters to work orders based on the provided filter criteria
 */
export const applyFilters = (orders: WorkOrder[], filters: WorkOrderFilters): WorkOrder[] => {
  return orders.filter(order => {
    // Filter by status
    if (filters.status && order.status !== filters.status) {
      // Special case for 'flagged' which includes 'flagged_followup'
      if (!(filters.status === 'flagged' && 
        (order.status === 'flagged' || order.status === 'flagged_followup'))) {
        return false;
      }
    }
    
    // Filter by orderNo
    if (filters.orderNo && !order.order_no.toLowerCase().includes(filters.orderNo.toLowerCase())) {
      return false;
    }
    
    // Filter by driver name
    if (filters.driver && order.driver) {
      const driverName = typeof order.driver === 'object' && order.driver.name 
        ? order.driver.name.toLowerCase() 
        : '';
      if (!driverName.includes(filters.driver.toLowerCase())) {
        return false;
      }
    }
    
    // Filter by location name
    if (filters.location && order.location) {
      const locationName = typeof order.location === 'object' 
        ? (order.location.name || order.location.locationName || '').toLowerCase()
        : '';
      if (!locationName.includes(filters.location.toLowerCase())) {
        return false;
      }
    }
    
    // Filter by date range
    if (filters.dateRange.from || filters.dateRange.to) {
      if (!order.service_date) return false;
      
      const orderDate = new Date(order.service_date);
      if (isNaN(orderDate.getTime())) return false;
      
      if (filters.dateRange.from) {
        const fromDate = new Date(filters.dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        if (orderDate < fromDate) return false;
      }
      
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (orderDate > toDate) return false;
      }
    }
    
    return true;
  });
};

/**
 * Creates handlers for updating filters
 */
export const useFilterHandlers = (
  setFilters: React.Dispatch<React.SetStateAction<WorkOrderFilters>>,
  setPagination: React.Dispatch<React.SetStateAction<any>>
) => {
  const handleFiltersChange = (newFilters: WorkOrderFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
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
      }
      
      return newFilters;
    });
    
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
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
      }
      
      return newFilters;
    });
    
    // Reset to first page when filters are cleared
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: null,
      dateRange: { from: null, to: null },
      driver: null,
      location: null,
      orderNo: null
    });
    
    // Reset to first page when all filters are cleared
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return {
    handleFiltersChange,
    handleColumnFilterChange,
    clearColumnFilter,
    clearAllFilters
  };
};
