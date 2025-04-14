
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { WorkOrder } from "../types";
import { ActionsMenu } from "./ActionsMenu";
import { StatusBadgeDropdown } from "../StatusBadgeDropdown";
import { formatLocalTime } from "@/utils/dateUtils";

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

  // Get end date and time from completion data, or fall back to service_date
  const getServiceDateTime = (order: WorkOrder): string => {
    // Try to get the end date from completion data first
    const endTime = order.completion_response?.orders?.[0]?.data?.endTime?.localTime;
    
    if (endTime) {
      return formatLocalTime(endTime, "MMM d, yyyy h:mmaaa", "N/A");
    }
    
    // Fall back to service_date if end date is not available or invalid
    if (order.service_date) {
      return formatLocalTime(order.service_date, "MMM d, yyyy", "N/A");
    }
    
    // Fall back to end_time if available
    if (order.end_time) {
      return formatLocalTime(order.end_time, "MMM d, yyyy h:mmaaa", "N/A");
    }
    
    return "N/A";
  };

  // Determine which attribution data to show based on current status
  const getStatusAttributionInfo = (workOrder: WorkOrder) => {
    const status = workOrder.status;
    
    if (status === "approved" && workOrder.approved_user && workOrder.approved_at) {
      return {
        user: workOrder.approved_user,
        timestamp: workOrder.approved_at
      };
    } else if ((status === "flagged" || status === "flagged_followup") && workOrder.flagged_user && workOrder.flagged_at) {
      return {
        user: workOrder.flagged_user,
        timestamp: workOrder.flagged_at
      };
    } else if (status === "resolved" && workOrder.resolved_user && workOrder.resolved_at) {
      return {
        user: workOrder.resolved_user,
        timestamp: workOrder.resolved_at
      };
    } else if (status === "rejected" && workOrder.rejected_user && workOrder.rejected_at) {
      return {
        user: workOrder.rejected_user,
        timestamp: workOrder.rejected_at
      };
    } else if (workOrder.last_action_user && workOrder.last_action_at) {
      return {
        user: workOrder.last_action_user,
        timestamp: workOrder.last_action_at
      };
    }
    
    return { user: undefined, timestamp: undefined };
  };

  const attributionInfo = getStatusAttributionInfo(workOrder);

  return (
    <TableRow 
      className="group cursor-pointer"
      onClick={() => onImageView(workOrder.id)}
    >
      <TableCell className="font-medium">{workOrder.order_no || 'N/A'}</TableCell>
      <TableCell>
        {getServiceDateTime(workOrder)}
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {getDriverName(workOrder)}
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {getLocationName(workOrder)}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <StatusBadgeDropdown
          workOrderId={workOrder.id}
          currentStatus={workOrder.status || 'pending_review'}
          completionStatus={getCompletionStatus(workOrder)}
          statusUser={attributionInfo.user}
          statusTimestamp={attributionInfo.timestamp}
        />
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()} className="transition-opacity">
        <div className="flex items-center space-x-2 opacity-70 group-hover:opacity-100">
          <Button 
            variant="ghost" 
            size="icon"
            title="View Proof of Service"
            onClick={(e) => {
              e.stopPropagation();
              onImageView(workOrder.id);
            }}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <ActionsMenu 
            workOrderId={workOrder.id}
            workOrder={workOrder}
            onStatusUpdate={onStatusUpdate}
            onDelete={onDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
