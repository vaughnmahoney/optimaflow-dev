
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { WorkOrder, SortDirection, SortField, PaginationState } from "../types";
import { WorkOrderTableHeader } from "./TableHeader";
import { WorkOrderRow } from "./WorkOrderRow";
import { EmptyState } from "./EmptyState";
import { useSortableTable } from "./useSortableTable";
import { Pagination } from "./Pagination";

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
  onPageSizeChange
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

  return (
    <div className="rounded-md border">
      <Table>
        <WorkOrderTableHeader 
          sortField={sortField} 
          sortDirection={sortDirection} 
          onSort={handleSort}
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
  );
};
