
import { useState } from "react";
import { SortDirection, SortField, WorkOrder, WorkOrderFilters, PaginationState } from "@/components/workorders/types";
import { useWorkOrderMutations } from "./useWorkOrderMutations";
import { applyFilters, useFilterHandlers } from "./bulk-orders/useWorkOrderFilters";
import { sortWorkOrders, useSortHandlers } from "./bulk-orders/useWorkOrderSorting";
import { paginateItems, usePaginationHandlers } from "./bulk-orders/useWorkOrderPagination";
import { calculateStatusCounts } from "./bulk-orders/useWorkOrderStatusCounts";

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
  
  // Initialize with default sorting by service_date descending (newest first)
  const [sortField, setSortField] = useState<SortField>('service_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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

  // Apply filters to orders
  const filteredOrders = applyFilters(orders, filters);

  // Calculate status counts
  const statusCounts = calculateStatusCounts(filteredOrders);

  // Sort filtered orders
  const sortedOrders = sortWorkOrders(filteredOrders, sortField, sortDirection);

  // Paginate sorted orders
  const paginatedOrders = paginateItems(sortedOrders, pagination);

  // Get filter handlers
  const {
    handleFiltersChange: setFiltersWithReset,
    handleColumnFilterChange: onColumnFilterChange,
    clearColumnFilter,
    clearAllFilters
  } = useFilterHandlers(setFilters, setPagination);

  // Get sort handlers
  const { handleSort: setSort } = useSortHandlers(setSortField, setSortDirection, setPagination);

  // Get pagination handlers
  const { handlePageChange, handlePageSizeChange } = usePaginationHandlers(setPagination);

  // Function to open image viewer - actual implementation is in WorkOrderList
  const openImageViewer = (workOrderId: string) => {
    console.log(`Opening images for work order: ${workOrderId}`);
    // This is handled by the WorkOrderList component internally
  };

  // Format return values to match useWorkOrderData
  return {
    workOrders: paginatedOrders,
    data: paginatedOrders, // Add this to match useWorkOrderData
    allWorkOrders: orders, // Keep for reference
    isLoading,
    filters,
    setFilters: setFiltersWithReset,
    onColumnFilterChange,
    clearColumnFilter,
    clearAllFilters,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder,
    statusCounts,
    sortField,
    sortDirection,
    setSort,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    refetch: () => {} // Empty function to match useWorkOrderData interface
  };
};
