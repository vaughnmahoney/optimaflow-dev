
import { useState } from "react";
import { SortDirection, SortField, WorkOrder, WorkOrderFilters, PaginationState } from "@/components/workorders/types";
import { useWorkOrderMutations } from "./useWorkOrderMutations";

/**
 * A specialized hook that adapts bulk order data to work with the WorkOrderContent component
 */
export const useBulkOrderWorkOrders = (
  orders: WorkOrder[],
  isLoading: boolean
) => {
  // Local state for filters, sorting and pagination
  const [filters, setFilters] = useState<WorkOrderFilters>({
    status: null,
    dateRange: { from: null, to: null },
    driver: null,
    location: null,
    orderNo: null
  });
  
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: orders.length
  });

  // Update pagination total when orders change
  if (pagination.total !== orders.length) {
    setPagination(prev => ({ ...prev, total: orders.length }));
  }

  // Get order mutations
  const { updateWorkOrderStatus, deleteWorkOrder } = useWorkOrderMutations();

  // Filter and sort orders based on current filter and sort settings
  const filteredOrders = orders.filter(order => {
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

  // Calculate status counts
  const statusCounts = {
    approved: filteredOrders.filter(order => order.status === 'approved').length,
    pending_review: filteredOrders.filter(order => order.status === 'pending_review' || order.status === 'imported').length,
    flagged: filteredOrders.filter(order => order.status === 'flagged' || order.status === 'flagged_followup').length,
    all: filteredOrders.length
  };

  // Sort orders
  let sortedOrders = [...filteredOrders];
  if (sortField && sortDirection) {
    sortedOrders.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (sortField) {
        case 'order_no':
          valueA = a.order_no || '';
          valueB = b.order_no || '';
          break;
        case 'service_date':
          const dateA = a.service_date ? new Date(a.service_date) : null;
          const dateB = b.service_date ? new Date(b.service_date) : null;
          
          const validA = dateA && !isNaN(dateA.getTime());
          const validB = dateB && !isNaN(dateB.getTime());
          
          if (validA && !validB) return sortDirection === 'asc' ? -1 : 1;
          if (!validA && validB) return sortDirection === 'asc' ? 1 : -1;
          if (!validA && !validB) return 0;
          
          return sortDirection === 'asc' 
            ? dateA!.getTime() - dateB!.getTime()
            : dateB!.getTime() - dateA!.getTime();
        case 'driver':
          valueA = a.driver && typeof a.driver === 'object' && a.driver.name
            ? a.driver.name.toLowerCase() : '';
          valueB = b.driver && typeof b.driver === 'object' && b.driver.name
            ? b.driver.name.toLowerCase() : '';
          break;
        case 'location':
          valueA = a.location && typeof a.location === 'object' 
            ? (a.location.name || a.location.locationName || '').toLowerCase() : '';
          valueB = b.location && typeof b.location === 'object'
            ? (b.location.name || b.location.locationName || '').toLowerCase() : '';
          break;
        case 'status':
          valueA = a.status || '';
          valueB = b.status || '';
          break;
        default:
          return 0;
      }
      
      // For strings
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // For other values
      return sortDirection === 'asc' 
        ? valueA - valueB 
        : valueB - valueA;
    });
  }

  // Paginate orders
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const paginatedOrders = sortedOrders.slice(
    startIndex, 
    startIndex + pagination.pageSize
  );

  // Handler functions
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };
  
  const handleFiltersChange = (newFilters: WorkOrderFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    // Reset to first page when sorting changes
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

  const openImageViewer = (workOrderId: string) => {
    console.log(`Opening images for work order: ${workOrderId}`);
    // This is handled by the WorkOrderList component internally
  };

  return {
    workOrders: paginatedOrders,
    allWorkOrders: orders, // The full list (for download, etc)
    isLoading,
    filters,
    setFilters: handleFiltersChange,
    onColumnFilterChange: handleColumnFilterChange,
    clearColumnFilter,
    clearAllFilters,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder,
    statusCounts,
    sortField,
    sortDirection,
    setSort: handleSort,
    pagination,
    handlePageChange,
    handlePageSizeChange
  };
};
