
import { TableRow, TableCell } from "@/components/ui/table";
import { StatusBadge } from "../StatusBadge";
import { WorkOrder } from "../types";
import { formatDate } from "@/utils/dateUtils";
import { ActionsMenu } from "./ActionsMenu";
import { Checkbox } from "@/components/ui/checkbox";

interface WorkOrderRowProps {
  workOrder: WorkOrder;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export const WorkOrderRow = ({
  workOrder,
  onStatusUpdate,
  onImageView,
  onDelete,
  selectable = false,
  selected = false,
  onSelect
}: WorkOrderRowProps) => {
  return (
    <TableRow className={selected ? "bg-muted/30" : undefined}>
      {selectable && (
        <TableCell className="w-10">
          <Checkbox 
            checked={selected} 
            onCheckedChange={onSelect}
            aria-label="Select work order"
          />
        </TableCell>
      )}
      <TableCell className="font-medium">{workOrder.order_no || "—"}</TableCell>
      <TableCell>
        {workOrder.service_date
          ? formatDate(new Date(workOrder.service_date), "MMM d, yyyy")
          : "—"}
      </TableCell>
      <TableCell>{workOrder.driver?.name || "—"}</TableCell>
      <TableCell>
        {workOrder.location?.name || workOrder.location?.locationName || "—"}
      </TableCell>
      <TableCell>
        <StatusBadge status={workOrder.status} />
      </TableCell>
      <TableCell>
        <ActionsMenu
          workOrder={workOrder}
          onStatusUpdate={onStatusUpdate}
          onImageView={onImageView}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};
