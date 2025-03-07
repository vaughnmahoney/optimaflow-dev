
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { WorkOrder, SortDirection, SortField, PaginationState, WorkOrderFilters } from "../types";
import { WorkOrderTableHeader } from "./TableHeader";
import { WorkOrderRow } from "./WorkOrderRow";
import { EmptyState } from "./EmptyState";
import { useSortableTable } from "./useSortableTable";
import { Pagination } from "./Pagination";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";

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
  onClearAllFilters
}: WorkOrderTableProps) => {
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

  // Check if any filter is active
  const hasActiveFilters = 
    filters.status !== null || 
    filters.orderNo !== null || 
    filters.driver !== null || 
    filters.location !== null || 
    filters.dateRange.from !== null || 
    filters.dateRange.to !== null;

  return (
    <div className="space-y-2">
      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="text-sm text-muted-foreground">
            Active filters applied
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="h-8 text-xs"
          >
            <FilterX className="h-3 w-3 mr-1" />
            Clear all filters
          </Button>
        </div>
      )}
    
      <div className="rounded-md border">
        <Table>
          <WorkOrderTableHeader 
            sortField={sortField} 
            sortDirection={sortDirection} 
            onSort={handleSort}
            filters={filters}
            onFilterChange={onColumnFilterChange}
            onFilterClear={onColumnFilterClear}
          />
          <TableBody>
            {workOrders.length === 0 ? (
              <EmptyState />
            ) : (
              workOrders.map((workOrder) => (
                <WorkOrderRow 
                  key={workOrder.id}
                  workOrder={workOrder}
                  onStatusUpdate={onStatusUpdate}
                  onImageView={onImageView}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
        
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
