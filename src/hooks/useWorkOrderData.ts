
import { useState } from "react";
import { SortField, SortDirection, PaginationState, WorkOrderFilters } from "@/components/workorders/types";
import { useWorkOrderFetch } from "./useWorkOrderFetch";
import { useWorkOrderStatusCounts } from "./useWorkOrderStatusCounts";
import { useWorkOrderMutations } from "./useWorkOrderMutations";
import { useWorkOrderImport } from "./useWorkOrderImport";

export const useWorkOrderData = () => {
  // Initialize filter state
  const [filters, setFilters] = useState<WorkOrderFilters>({
    status: null,
    dateRange: { from: null, to: null },
    driver: null,
    location: null,
    orderNo: null
  });
  
  // Initialize sorting (newest first by default)
  const [sortField, setSortField] = useState<SortField>('service_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Initialize pagination
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch work orders with current filters, pagination and sorting
  const { data: workOrdersData = { data: [], total: 0 }, isLoading, refetch } = useWorkOrderFetch(
    filters, 
    pagination.page, 
    pagination.pageSize,
    sortField,
    sortDirection
  );
  
  // Extract work orders and total count
  const workOrders = workOrdersData.data;
  const total = workOrdersData.total;
  
  // Update pagination state when total changes
  if (pagination.total !== total) {
    setPagination(prev => ({ ...prev, total }));
  }
  
  // Calculate status counts from current work orders
  const statusCounts = useWorkOrderStatusCounts(workOrders, filters.status);
  
  // Import and mutation methods
  const { searchOptimoRoute } = useWorkOrderImport();
  const { updateWorkOrderStatus, deleteWorkOrder } = useWorkOrderMutations();

  // Handle column filter changes
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

  // Clear a specific column filter
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

  // Clear all filters
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

  // Image viewer handler
  const openImageViewer = (workOrderId: string) => {
    console.log(`Opening images for work order: ${workOrderId}`);
  };

  // Sort handler
  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    // Reset to first page when sorting changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };
  
  // Filter change handler with page reset
  const handleFiltersChange = (newFilters: WorkOrderFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return {
    data: workOrders,
    isLoading,
    filters,
    setFilters: handleFiltersChange,
    onColumnFilterChange: handleColumnFilterChange,
    clearColumnFilter,
    clearAllFilters,
    searchOptimoRoute,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder,
    statusCounts,
    sortField,
    sortDirection,
    setSort: handleSort,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total
    },
    handlePageChange,
    handlePageSizeChange,
    refetch
  };
};
