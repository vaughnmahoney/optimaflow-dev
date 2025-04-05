
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { WorkOrder, SortDirection, SortField, PaginationState, WorkOrderFilters } from "../types";
import { WorkOrderTableHeader } from "./TableHeader";
import { WorkOrderRow } from "./WorkOrderRow";
import { WorkOrderCard } from "./WorkOrderCard";
import { EmptyState } from "./EmptyState";
import { useSortableTable } from "./useSortableTable";
import { Pagination } from "./Pagination";
import { PaginationIndicator } from "./PaginationIndicator";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { checkHasActiveFilters } from "../filters/filter-sort/filterUtils";
import { SearchBar } from "../search/SearchBar";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  filters: WorkOrderFilters;
  onColumnFilterChange: (column: string, value: any) => void;
  onColumnFilterClear: (column: string) => void;
  onClearAllFilters: () => void;
  onSearchChange?: (searchText: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const WorkOrderTable = ({ 
  workOrders: initialWorkOrders, 
  onStatusUpdate,
  onImageView,
  onDelete,
  sortField: externalSortField,
  sortDirection: externalSortDirection,
  onSort: externalOnSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  filters,
  onColumnFilterChange,
  onColumnFilterClear,
  onClearAllFilters,
  onSearchChange,
  onRefresh,
  isRefreshing
}: WorkOrderTableProps) => {
  const isMobile = useIsMobile();
  
  const { 
    workOrders, 
    sortField, 
    sortDirection, 
    handleSort 
  } = useSortableTable(
    initialWorkOrders, 
    externalSortField, 
    externalSortDirection, 
    externalOnSort
  );

  // Check if any non-date filter is active
  const hasActiveFilters = checkHasActiveFilters(filters, false);

  // Handle search
  const handleSearch = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar and Pagination in same row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex-1 max-w-[400px]">
          <SearchBar 
            initialValue={filters.searchText || ""} 
            onSearch={handleSearch}
            placeholder="Search orders, drivers, locations..." 
          />
        </div>
        
        <div className="flex items-center gap-2">
          {pagination && onPageChange && (
            <div className="flex-shrink-0">
              <PaginationIndicator 
                pagination={pagination}
                onPageChange={onPageChange}
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
              />
            </div>
          )}
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onClearAllFilters}
              className="h-7 flex-shrink-0"
            >
              <FilterX className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Card grid layout for both mobile and desktop */}
      <div className="space-y-2">
        {workOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={`grid gap-2 ${isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {workOrders.map((workOrder) => (
              <WorkOrderCard
                key={workOrder.id}
                workOrder={workOrder}
                onStatusUpdate={onStatusUpdate}
                onImageView={onImageView}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
        {pagination && onPageChange && onPageSizeChange && (
          <Pagination 
            pagination={pagination}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
    </div>
  );
};
