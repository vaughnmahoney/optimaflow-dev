import { WorkOrder, SortDirection, SortField, PaginationState } from "../types";
import { WorkOrderTableHeader } from "./TableHeader";
import { WorkOrderRow } from "./WorkOrderRow";
import { Table, TableBody } from "@/components/ui/table";
import { useSortableTable } from "./useSortableTable";
import { Pagination } from "./Pagination";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
  filters: {
    status: string | null;
    dateRange: { from: Date | null; to: Date | null };
    driver: string | null;
    location: string | null;
    orderNo: string | null;
  };
  onColumnFilterChange: (column: string, value: any) => void;
  onColumnFilterClear: (column: string) => void;
  onClearAllFilters: () => void;
}

export const WorkOrderTable = ({
  workOrders,
  onStatusUpdate,
  onImageView,
  onDelete,
  sortField,
  sortDirection,
  onSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  filters,
  onColumnFilterChange,
  onColumnFilterClear,
  onClearAllFilters
}: WorkOrderTableProps) => {
  // Use the updated sortable table hook - now just a pass-through for server-side sorting
  const { sortField: localSortField, sortDirection: localSortDirection, handleSort } = useSortableTable({
    workOrders,
    externalSortField: sortField,
    externalSortDirection: sortDirection,
    onSort
  });

  // Handle sorting - this will now call the parent's onSort callback
  const handleSortChange = (field: SortField) => {
    handleSort(field);
  };

  // Check if any filters are active
  const hasActiveFilters = 
    filters.status !== null || 
    filters.orderNo !== null || 
    filters.driver !== null || 
    filters.location !== null || 
    (filters.dateRange.from !== null || filters.dateRange.to !== null);

  return (
    <div className="space-y-4">
      {/* Filter indicator and clear button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Filters applied
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="h-8 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all filters
          </Button>
        </div>
      )}

      <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        <Table>
          <WorkOrderTableHeader
            sortField={localSortField}
            sortDirection={localSortDirection}
            onSort={handleSortChange}
            filters={filters}
            onFilterChange={onColumnFilterChange}
            onFilterClear={onColumnFilterClear}
          />
          <TableBody>
            {workOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-24 text-center text-gray-500 dark:text-gray-400">
                  No work orders found
                </td>
              </tr>
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
      </div>

      {/* Pagination controls */}
      {pagination && onPageChange && onPageSizeChange && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
};
