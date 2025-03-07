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
import { FilterX, CheckSquare, Square } from "lucide-react";
import { useState } from "react";
import { BulkActionsBar } from "./BulkActionsBar";

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
  onBulkStatusUpdate?: (workOrderIds: string[], newStatus: string) => void;
  onBulkDelete?: (workOrderIds: string[]) => void;
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
  onBulkStatusUpdate,
  onBulkDelete
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

  // Selection state
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<string[]>([]);
  
  // Check if any filter is active
  const hasActiveFilters = 
    filters.status !== null || 
    filters.orderNo !== null || 
    filters.driver !== null || 
    filters.location !== null || 
    filters.dateRange.from !== null || 
    filters.dateRange.to !== null;

  // Handle item selection
  const handleSelectWorkOrder = (workOrderId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedWorkOrders(prev => [...prev, workOrderId]);
    } else {
      setSelectedWorkOrders(prev => prev.filter(id => id !== workOrderId));
    }
  };

  // Select all work orders on current page
  const handleSelectAll = () => {
    if (selectedWorkOrders.length === workOrders.length) {
      // If all are selected, deselect all
      setSelectedWorkOrders([]);
    } else {
      // Otherwise select all
      setSelectedWorkOrders(workOrders.map(wo => wo.id));
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedWorkOrders([]);
  };

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
      
      {/* Bulk actions bar */}
      {selectedWorkOrders.length > 0 && onBulkStatusUpdate && onBulkDelete && (
        <BulkActionsBar 
          selectedCount={selectedWorkOrders.length}
          onApprove={() => onBulkStatusUpdate(selectedWorkOrders, 'approved')}
          onFlag={() => onBulkStatusUpdate(selectedWorkOrders, 'flagged')}
          onDelete={() => {
            onBulkDelete(selectedWorkOrders);
            setSelectedWorkOrders([]);
          }}
          onClearSelection={handleClearSelection}
        />
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
            selectable={true}
            allSelected={selectedWorkOrders.length === workOrders.length && workOrders.length > 0}
            onSelectAll={handleSelectAll}
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
                  selectable={true}
                  selected={selectedWorkOrders.includes(workOrder.id)}
                  onSelect={(isSelected) => handleSelectWorkOrder(workOrder.id, isSelected)}
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
