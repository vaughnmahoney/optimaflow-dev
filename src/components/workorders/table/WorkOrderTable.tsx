
import { Table } from "@/components/ui/table";
import { WorkOrderRow } from "./WorkOrderRow";
import { WorkOrder, WorkOrderFilters, SortDirection, SortField, PaginationState } from "../types";
import { TableHeader } from "./TableHeader";
import { PaginationIndicator } from "./PaginationIndicator";
import { EmptyState } from "./EmptyState";
import { WorkOrderCard } from "./WorkOrderCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAutoImport } from "@/hooks/useAutoImport";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusUpdate: (workOrderId: string, newStatus: string, options?: any) => void;
  onImageView: (workOrderId: string) => void;
  onDelete?: (workOrderId: string) => void;
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
  onRefresh?: () => Promise<any>;
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
  onClearAllFilters,
  onRefresh
}: WorkOrderTableProps) => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { isImporting, runAutoImport } = useAutoImport();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing || isImporting) return;
    
    setIsRefreshing(true);
    
    try {
      // First refresh the current data
      if (onRefresh) {
        await onRefresh();
      }
      
      // Then run the auto import to check for new orders
      const importSuccess = await runAutoImport();
      
      if (!importSuccess) {
        toast.success("Work orders refreshed");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh work orders");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (workOrders.length === 0) {
    return <EmptyState />;
  }

  // Mobile view with cards
  if (isMobile) {
    return (
      <div className="space-y-2">
        {pagination && onPageChange && (
          <PaginationIndicator 
            pagination={pagination} 
            onPageChange={onPageChange}
            onRefresh={handleRefresh}
          />
        )}
        {workOrders.map(workOrder => (
          <WorkOrderCard
            key={workOrder.id}
            workOrder={workOrder}
            onStatusUpdate={onStatusUpdate}
            onImageView={onImageView}
            onDelete={onDelete}
          />
        ))}
        {pagination && onPageChange && (
          <PaginationIndicator 
            pagination={pagination} 
            onPageChange={onPageChange}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    );
  }

  // Desktop view with table
  return (
    <div>
      {pagination && onPageChange && (
        <PaginationIndicator 
          pagination={pagination} 
          onPageChange={onPageChange} 
          onRefresh={handleRefresh}
        />
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader 
            sortField={sortField} 
            sortDirection={sortDirection}
            onSort={onSort}
            filters={filters}
            onColumnFilterChange={onColumnFilterChange}
            onColumnFilterClear={onColumnFilterClear}
          />
          <tbody>
            {workOrders.map(workOrder => (
              <WorkOrderRow
                key={workOrder.id}
                workOrder={workOrder}
                onStatusUpdate={onStatusUpdate}
                onImageView={onImageView}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </Table>
      </div>
      {pagination && onPageChange && pagination.total > workOrders.length && (
        <PaginationIndicator 
          pagination={pagination} 
          onPageChange={onPageChange}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};
