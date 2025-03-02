
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
    searchQuery: ""
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
  const { updateWorkOrderStatus, deleteWorkOrder } = useWorkOrderMutations();

  const searchWorkOrder = (query: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: query
    }));
    // Reset to first page when searching
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
    searchWorkOrder,
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
