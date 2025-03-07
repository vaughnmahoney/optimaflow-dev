import { useState } from "react";
import { SortField, SortDirection, PaginationState, WorkOrderFilters } from "@/components/workorders/types";
import { useWorkOrderFetch } from "./useWorkOrderFetch";
import { useWorkOrderStatusCounts } from "./useWorkOrderStatusCounts";
import { useWorkOrderMutations } from "./useWorkOrderMutations";
import { useWorkOrderImport } from "./useWorkOrderImport";

export const useWorkOrderData = () => {
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
    total: 0
  });

  // Fetch work orders with pagination and filters
  const { data: workOrdersData = { data: [], total: 0 }, isLoading, refetch } = useWorkOrderFetch(
    filters, 
    pagination.page, 
    pagination.pageSize,
    sortField,
    sortDirection
  );
  
  // Update total count when data changes
  const workOrders = workOrdersData.data;
  const total = workOrdersData.total;
  
  // Update pagination state when total changes
  if (pagination.total !== total) {
    setPagination(prev => ({ ...prev, total }));
  }
  
  // Get status counts
  const statusCounts = useWorkOrderStatusCounts(workOrders, filters.status);
  
  // Import and mutation methods
  const { searchOptimoRoute } = useWorkOrderImport();
  const { 
    updateWorkOrderStatus, 
    deleteWorkOrder,
    bulkUpdateWorkOrderStatus,
    bulkDeleteWorkOrders
  } = useWorkOrderMutations();

  // Handle column filter changes
  const handleColumnFilterChange = (column: string, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Handle each column type specifically
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
    handlePageChange(1);
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
    handlePageChange(1);
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
    handlePageChange(1);
  };

  const openImageViewer = (workOrderId: string) => {
    // Implementation would depend on how the image viewer is rendered
    console.log(`Opening images for work order: ${workOrderId}`);
  };

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    // Reset to first page when sorting
    handlePageChange(1);
  };
  
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };
  
  const handleFiltersChange = (newFilters: WorkOrderFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    handlePageChange(1);
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
    bulkUpdateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder,
    bulkDeleteWorkOrders,
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
