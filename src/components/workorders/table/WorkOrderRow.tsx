
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "../StatusBadge";
import { WorkOrder } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionsMenu } from "./ActionsMenu";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";

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
    return order.search_response?.scheduleInformation?.driverName || 'No Driver Assigned';
  };

  const hasQcNotes = workOrder.qc_notes && workOrder.qc_notes.trim().length > 0;

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
        <div className="flex items-center gap-2">
          <StatusBadge status={workOrder.status || 'pending_review'} />
          {hasQcNotes && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="px-2 py-1">Has QC Notes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
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
