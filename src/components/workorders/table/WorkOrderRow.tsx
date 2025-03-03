
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "../StatusBadge";
import { WorkOrder } from "../types";
import { ActionsMenu } from "./ActionsMenu";

interface WorkOrderRowProps {
  workOrder: WorkOrder;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
}

export const WorkOrderRow = ({ workOrder, onStatusUpdate, onImageView, onDelete }: WorkOrderRowProps) => {
  const getLocationName = (order: WorkOrder): string => {
    if (!order.location) return 'N/A';
    return order.location.name || order.location.locationName || 'N/A';
  };

  const getDriverName = (order: WorkOrder): string => {
    if (!order.driver) return 'No Driver Assigned';
    return order.driver.name || 'No Driver Name';
  };

  return (
    <TableRow>
      <TableCell>{workOrder.order_no || 'N/A'}</TableCell>
      <TableCell>
        {workOrder.service_date ? format(new Date(workOrder.service_date), "MMM d, yyyy") : "N/A"}
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {getDriverName(workOrder)}
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {getLocationName(workOrder)}
      </TableCell>
      <TableCell>
        <StatusBadge status={workOrder.status || 'pending_review'} />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            title="View Proof of Service"
            onClick={() => onImageView(workOrder.id)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <ActionsMenu 
            workOrder={workOrder}
            onStatusUpdate={onStatusUpdate}
            onDelete={onDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
