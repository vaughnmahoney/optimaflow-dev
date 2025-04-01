
import { WorkOrder } from "../types";
import { StatusBadge } from "../StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { ActionsMenu } from "./ActionsMenu";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getBestWorkOrderDate } from "@/utils/workOrderUtils";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
}

export const WorkOrderCard = ({ workOrder, onStatusUpdate, onImageView, onDelete }: WorkOrderCardProps) => {
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

  // Get service date and time using the shared utility function
  const getServiceDateTime = (order: WorkOrder): string => {
    const date = getBestWorkOrderDate(order);
    
    if (date) {
      try {
        // Format with time if from completion data, otherwise just date
        if (order.completion_response?.orders?.[0]?.data?.endTime?.localTime) {
          return format(date, "MMM d, yyyy h:mmaaa");
        } else {
          return format(date, "MMM d, yyyy");
        }
      } catch (error) {
        console.error("Error formatting date:", error);
        return "N/A";
      }
    }
    
    return "N/A";
  };

  return (
    <Card 
      className="overflow-hidden shadow-sm hover:shadow transition-shadow cursor-pointer"
      onClick={() => onImageView(workOrder.id)}
    >
      {/* Card header with order number and status */}
      <div className="p-3 border-b flex justify-between items-center bg-gray-50">
        <div className="font-medium">{workOrder.order_no || 'N/A'}</div>
        <StatusBadge 
          status={workOrder.status || 'pending_review'} 
          completionStatus={getCompletionStatus(workOrder)}
        />
      </div>

      {/* Card body with order details */}
      <div className="p-3 space-y-2">
        <div className="text-sm flex justify-between items-start">
          <span className="text-muted-foreground">Driver:</span>
          <span className="text-right font-medium max-w-[70%] break-words">{getDriverName(workOrder)}</span>
        </div>
        <div className="text-sm flex justify-between items-start">
          <span className="text-muted-foreground">Location:</span>
          <span className="text-right font-medium max-w-[70%] break-words">{getLocationName(workOrder)}</span>
        </div>
        <div className="text-sm flex justify-between items-center">
          <span className="text-muted-foreground">Date:</span>
          <span className="text-right font-medium">{getServiceDateTime(workOrder)}</span>
        </div>
      </div>

      {/* Card footer with actions */}
      <div className="px-3 py-2 border-t flex justify-end items-center bg-gray-50">
        <div className="flex items-center space-x-2 opacity-80 hover:opacity-100">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onImageView(workOrder.id);
            }}
            className="h-8 w-8"
            title="View Proof of Service"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <ActionsMenu 
            workOrder={workOrder}
            onStatusUpdate={onStatusUpdate}
            onDelete={onDelete}
          />
        </div>
      </div>
    </Card>
  );
};
