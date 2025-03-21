import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "../StatusBadge";
import { WorkOrder } from "../types";
import { ActionsMenu } from "./ActionsMenu";
import { useSortableTable } from "./useSortableTable";

interface WorkOrderRowProps {
  workOrder: WorkOrder;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
}

export const WorkOrderRow = ({ workOrder, onStatusUpdate, onImageView, onDelete }: WorkOrderRowProps) => {
  // Use the utility functions from useSortableTable
  const { getLocationName, getDriverName } = useSortableTable({ workOrders: [workOrder] });

  // Extract the completion status from the appropriate place in the order object
  const getCompletionStatus = (order: WorkOrder): string | undefined => {
    return order.completion_status || 
           (order.completionDetails?.data?.status) ||
           (order.completion_response?.orders?.[0]?.data?.status) ||
           (order.search_response?.scheduleInformation?.status);
  };

  // Get end date from completion data, or fall back to service_date
  const getServiceDate = (order: WorkOrder): string => {
    // Try to get the end date from completion data first
    const endTime = order.completion_response?.orders?.[0]?.data?.endTime?.localTime;
    
    if (endTime) {
      try {
        const date = new Date(endTime);
        if (!isNaN(date.getTime())) {
          return format(date, 'MMM d, yyyy');
        }
      } catch (error) {
        // If date parsing fails, continue to fallback
      }
    }
    
    // Fall back to service_date if available
    if (order.service_date) {
      try {
        const date = new Date(order.service_date);
        if (!isNaN(date.getTime())) {
          return format(date, 'MMM d, yyyy');
        }
      } catch (error) {
        // If parsing fails, return the raw string
        return order.service_date;
      }
    }
    
    return 'No date';
  };

  return (
    <TableRow className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
      <TableCell className="font-medium text-gray-900 dark:text-gray-100">{workOrder.order_no || 'N/A'}</TableCell>
      <TableCell className="text-gray-700 dark:text-gray-300">{getServiceDate(workOrder)}</TableCell>
      <TableCell className="max-w-xs truncate text-gray-700 dark:text-gray-300">{getDriverName(workOrder)}</TableCell>
      <TableCell className="max-w-xs truncate text-gray-700 dark:text-gray-300">{getLocationName(workOrder)}</TableCell>
      <TableCell>
        <StatusBadge 
          status={workOrder.status || 'pending_review'} 
          completionStatus={getCompletionStatus(workOrder)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2 opacity-90 group-hover:opacity-100">
          <Button 
            variant="ghost" 
            size="icon"
            title="View Proof of Service"
            onClick={() => onImageView(workOrder.id)}
            className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
