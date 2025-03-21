
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
    
    if (typeof order.location === 'object') {
      return order.location.name || order.location.locationName || 'N/A';
    }
    
    return 'N/A';
  };

  const getDriverName = (order: WorkOrder): string => {
    if (!order.driver) return 'No Driver Assigned';
    
    if (typeof order.driver === 'object' && order.driver.name) {
      return order.driver.name;
    }
    
    return 'No Driver Name';
  };

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
        return format(new Date(endTime), "MMM d, yyyy");
      } catch (error) {
        // If date parsing fails, fall back to service_date
        console.error("Error formatting end date:", error);
      }
    }
    
    // Fall back to service_date if end date is not available or invalid
    if (order.service_date) {
      try {
        return format(new Date(order.service_date), "MMM d, yyyy");
      } catch (error) {
        console.error("Error formatting service date:", error);
        return "N/A";
      }
    }
    
    return "N/A";
  };

  return (
    <TableRow>
      <TableCell>{workOrder.order_no || 'N/A'}</TableCell>
      <TableCell>
        {getServiceDate(workOrder)}
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {getDriverName(workOrder)}
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {getLocationName(workOrder)}
      </TableCell>
      <TableCell>
        <StatusBadge 
          status={workOrder.status || 'pending_review'} 
          completionStatus={getCompletionStatus(workOrder)}
        />
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
