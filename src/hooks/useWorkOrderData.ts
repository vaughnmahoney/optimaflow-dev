
import { useState } from "react";
import { SortField, SortDirection, PaginationState } from "@/components/workorders/types";
import { useWorkOrderFetch } from "./useWorkOrderFetch";
import { useWorkOrderStatusCounts } from "./useWorkOrderStatusCounts";
import { useWorkOrderMutations } from "./useWorkOrderMutations";
import { useWorkOrderImport } from "./useWorkOrderImport";

export const useWorkOrderData = () => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch work orders with pagination
  const { data: workOrdersData = { data: [], total: 0 }, isLoading, refetch } = useWorkOrderFetch(
    statusFilter, 
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
  const statusCounts = useWorkOrderStatusCounts(workOrders, statusFilter);
  
  // Import and mutation methods
  const { searchOptimoRoute } = useWorkOrderImport();
  const { updateWorkOrderStatus, deleteWorkOrder } = useWorkOrderMutations();

  const searchWorkOrder = (query: string) => {
    setSearchQuery(query);
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

  return {
    data: workOrders,
    isLoading,
    statusFilter,
    setStatusFilter,
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
