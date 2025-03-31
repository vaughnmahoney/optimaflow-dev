
import { WorkOrder } from "../types";
import { StatusBadge } from "../StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { ActionsMenu } from "./ActionsMenu";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

  // Get status badge background color for the order card header
  const getStatusColor = (status: string | undefined): string => {
    switch(status) {
      case 'approved': return 'bg-green-500';
      case 'pending_review': return 'bg-yellow-500';
      case 'flagged': return 'bg-red-500';
      case 'resolved': return 'bg-blue-500';
      case 'rejected': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card 
      className="mb-3 overflow-hidden shadow-sm hover:shadow transition-shadow"
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
      <div className="p-3 space-y-1.5">
        <div className="text-sm flex justify-between items-start">
          <span className="text-muted-foreground">Driver:</span>
          <span className="text-right font-medium max-w-[60%] truncate">{getDriverName(workOrder)}</span>
        </div>
        <div className="text-sm flex justify-between items-start">
          <span className="text-muted-foreground">Location:</span>
          <span className="text-right font-medium max-w-[60%] truncate">{getLocationName(workOrder)}</span>
        </div>
        <div className="text-sm flex justify-between items-center">
          <span className="text-muted-foreground">Date:</span>
          <span className="text-right font-medium">{getServiceDate(workOrder)}</span>
        </div>
      </div>

      {/* Card footer with actions */}
      <div className="px-3 py-2 border-t flex justify-end items-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onImageView(workOrder.id);
            }}
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
      </div>
    </Card>
  );
};
