
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
    
    // Filter by date range, prioritizing end_time over service_date
    if (filters.dateRange.from || filters.dateRange.to) {
      // Try to get a valid date from either end_time or service_date
      let orderDate: Date | null = null;
      
      // First try end_time if available
      if (order.end_time) {
        const endTimeDate = new Date(order.end_time);
        if (!isNaN(endTimeDate.getTime())) {
          orderDate = endTimeDate;
        }
      }
      
      // If no valid end_time, fall back to service_date
      if (!orderDate && order.service_date) {
        const serviceDate = new Date(order.service_date);
        if (!isNaN(serviceDate.getTime())) {
          orderDate = serviceDate;
        }
      }
      
      // If no valid date available, filter this record out
      if (!orderDate) return false;
      
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
