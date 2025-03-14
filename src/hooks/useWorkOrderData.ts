
import { useState, useCallback } from "react";
import { SortField, SortDirection, PaginationState, WorkOrderFilters } from "@/components/workorders/types";
import { useWorkOrderFetch } from "./useWorkOrderFetch";
import { useWorkOrderStatusCounts } from "./useWorkOrderStatusCounts";
import { useWorkOrderMutations } from "./useWorkOrderMutations";
import { useWorkOrderImport } from "./useWorkOrderImport";

export const useWorkOrderData = () => {
  // Initialize filters state
  const [filters, setFilters] = useState<WorkOrderFilters>({
    status: null,
    dateRange: { from: null, to: null },
    driver: null,
    location: null,
    orderNo: null
  });
  
  // Initialize sorting state
  const [sortField, setSortField] = useState<SortField>('service_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Initialize pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch work orders with all necessary parameters
  const { 
    data: workOrdersData = { data: [], total: 0 }, 
    isLoading, 
    refetch 
  } = useWorkOrderFetch(
    filters, 
    pagination.page, 
    pagination.pageSize,
    sortField,
    sortDirection
  );
  
  // Extract work orders and total count
  const workOrders = workOrdersData.data;
  const total = workOrdersData.total;
  
  // Update pagination total if it has changed
  if (pagination.total !== total) {
    setPagination(prev => ({ ...prev, total }));
  }
  
  // Calculate status counts
  const statusCounts = useWorkOrderStatusCounts(workOrders, filters.status);
  
  // Import utility hooks
  const { searchOptimoRoute } = useWorkOrderImport();
  const { updateWorkOrderStatus, deleteWorkOrder } = useWorkOrderMutations();

  // Reset page when filters change
  const resetPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Handle column filter changes
  const handleColumnFilterChange = useCallback((column: string, value: any) => {
    console.log(`Column filter changed: ${column} = `, value);
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (column) {
        case 'order_no':
          newFilters.orderNo = value;
          break;
        case 'service_date':
          // Ensure date objects are properly handled
          if (value === null || typeof value === 'string') {
            newFilters.dateRange = { from: null, to: null };
          } else {
            newFilters.dateRange = {
              from: value.from ? new Date(value.from) : null,
              to: value.to ? new Date(value.to) : null
            };
          }
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
    
    resetPage();
  }, [resetPage]);

  // Clear a single column filter
  const clearColumnFilter = useCallback((column: string) => {
    console.log(`Clearing column filter: ${column}`);
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
    
    resetPage();
  }, [resetPage]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    console.log("Clearing all filters");
    setFilters({
      status: null,
      dateRange: { from: null, to: null },
      driver: null,
      location: null,
      orderNo: null
    });
    
    resetPage();
  }, [resetPage]);

  // Open image viewer (placeholder for now)
  const openImageViewer = useCallback((workOrderId: string) => {
    console.log(`Opening images for work order: ${workOrderId}`);
  }, []);

  // Handle sorting changes
  const handleSort = useCallback((field: SortField, direction: SortDirection) => {
    console.log(`Sorting changed: ${field} ${direction}`);
    setSortField(field);
    setSortDirection(direction);
    resetPage();
  }, [resetPage]);
  
  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    console.log(`Page changed to: ${page}`);
    const newPage = Math.max(1, page);
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);
  
  // Handle page size changes
  const handlePageSizeChange = useCallback((pageSize: number) => {
    console.log(`Page size changed to: ${pageSize}`);
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);
  
  // Handle filter changes (used by status cards)
  const handleFiltersChange = useCallback((newFilters: WorkOrderFilters) => {
    console.log("Filters changed:", newFilters);
    setFilters(newFilters);
    resetPage();
  }, [resetPage]);

  // Return all necessary data and handlers
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
