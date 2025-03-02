
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { WorkOrder } from "./types";
import { WorkOrderTableHeader } from "./table/TableHeader";
import { WorkOrderRow } from "./table/WorkOrderRow";
import { EmptyState } from "./table/EmptyState";
import { useSortableTable } from "./table/useSortableTable";

// Import types
import { SortDirection, SortField } from "./types";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
}

export const WorkOrderTable = ({ 
  workOrders: initialWorkOrders, 
  onStatusUpdate,
  onImageView,
  onDelete,
  sortField: externalSortField,
  sortDirection: externalSortDirection,
  onSort: externalOnSort
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
    </div>
  );
};
