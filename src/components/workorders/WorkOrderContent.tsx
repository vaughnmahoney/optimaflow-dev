
import { WorkOrderList } from "./WorkOrderList";
import { WorkOrder, SortDirection, SortField, PaginationState } from "./types";

interface WorkOrderContentProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOptimoRouteSearch: (value: string) => void;
  statusCounts?: {
    approved: number;
    pending_review: number;
    flagged: number;
    all?: number;
  };
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const WorkOrderContent = ({
  workOrders,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  onStatusUpdate,
  onImageView,
  onDelete,
  searchQuery,
  onSearchChange,
  onOptimoRouteSearch,
  statusCounts = { approved: 0, pending_review: 0, flagged: 0 },
  sortField,
  sortDirection,
  onSort,
  pagination,
  onPageChange,
  onPageSizeChange
}: WorkOrderContentProps) => {
  return (
    <WorkOrderList
      workOrders={workOrders}
      isLoading={isLoading}
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      onStatusUpdate={onStatusUpdate}
      onImageView={onImageView}
      onDelete={onDelete}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onOptimoRouteSearch={onOptimoRouteSearch}
      statusCounts={statusCounts}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
};
