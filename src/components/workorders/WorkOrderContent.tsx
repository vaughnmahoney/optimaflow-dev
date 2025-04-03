
import { WorkOrderList } from './WorkOrderList';
import { WorkOrderFilters, SortDirection, SortField, PaginationState, WorkOrder } from './types';

interface WorkOrderContentProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  filters: WorkOrderFilters;
  onFiltersChange: (filters: WorkOrderFilters) => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  onSearchChange?: (searchTerm: string) => void;
  onOptimoRouteSearch: (orderNumber: string) => void;
  statusCounts: {
    approved: number;
    pending_review: number;
    flagged: number;
    resolved: number;
    rejected: number;
    all: number;
  };
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField, direction: SortDirection) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onColumnFilterChange: (column: string, value: any) => void;
  clearColumnFilter: (column: string) => void;
  clearAllFilters: () => void;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
  cachedWorkOrder?: WorkOrder | null;
  clearCachedWorkOrder?: () => void;
  // New props
  isImageModalOpen: boolean;
  selectedWorkOrderId: string | null;
  onCloseImageModal: () => void;
}

export const WorkOrderContent = ({
  workOrders,
  isLoading,
  filters,
  onFiltersChange,
  onStatusUpdate,
  onImageView,
  onDelete,
  onSearchChange,
  onOptimoRouteSearch,
  statusCounts,
  sortField,
  sortDirection,
  onSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  onColumnFilterChange,
  clearColumnFilter,
  clearAllFilters,
  onResolveFlag,
  cachedWorkOrder,
  clearCachedWorkOrder,
  // Pass the new props
  isImageModalOpen,
  selectedWorkOrderId,
  onCloseImageModal
}: WorkOrderContentProps) => {
  return (
    <WorkOrderList
      workOrders={workOrders}
      isLoading={isLoading}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onStatusUpdate={onStatusUpdate}
      onImageView={onImageView}
      onDelete={onDelete}
      onSearchChange={onSearchChange}
      onOptimoRouteSearch={onOptimoRouteSearch}
      statusCounts={statusCounts}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onColumnFilterChange={onColumnFilterChange}
      clearColumnFilter={clearColumnFilter}
      clearAllFilters={clearAllFilters}
      onResolveFlag={onResolveFlag}
      cachedWorkOrder={cachedWorkOrder}
      clearCachedWorkOrder={clearCachedWorkOrder}
      // Pass the new props
      isImageModalOpen={isImageModalOpen}
      selectedWorkOrderId={selectedWorkOrderId}
      onCloseImageModal={onCloseImageModal}
    />
  );
};
