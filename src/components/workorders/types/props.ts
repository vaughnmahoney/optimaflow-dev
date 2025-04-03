import { ReactNode } from "react";
import { WorkOrder } from './workOrder';
import { WorkOrderFilters } from './filtering';
import { SortField, SortDirection } from './sorting';
import { PaginationState } from './pagination';

/**
 * Component prop types
 */
export interface WorkOrderListProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  filters: WorkOrderFilters;
  onFiltersChange: (filters: WorkOrderFilters) => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  onSearchChange?: (value: string) => void;
  onOptimoRouteSearch: (value: string) => void;
  statusCounts?: {
    approved: number;
    pending_review: number;
    flagged: number;
    resolved: number;
    rejected: number;
    all?: number;
  };
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onColumnFilterChange: (column: string, value: any) => void;
  clearColumnFilter: (column: string) => void;
  clearAllFilters: () => void;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
  selectedWorkOrderId?: string | null;
  isImageModalOpen?: boolean;
  activeWorkOrder?: WorkOrder | null;
  onCloseImageModal?: () => void;
}

export interface StatusFilterProps {
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
}

// Required to be exported but the data is handled within the debug component
export interface DebugDisplayProps {
  searchResponse?: any;
  transformedData?: any;
}

export interface FilterSortButtonProps {
  filters: WorkOrderFilters;
  onColumnFilterChange: (column: string, value: any) => void;
  clearColumnFilter: (column: string) => void;
  clearAllFilters: () => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
}
