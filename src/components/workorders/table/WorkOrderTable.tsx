
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { WorkOrder } from "../types";
import { SimpleTableHeader } from "./SimpleTableHeader";
import { WorkOrderRow } from "./WorkOrderRow";
import { EmptyState } from "./EmptyState";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
}

export const WorkOrderTable = ({ 
  workOrders, 
  onStatusUpdate,
  onImageView,
  onDelete,
}: WorkOrderTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <SimpleTableHeader />
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
