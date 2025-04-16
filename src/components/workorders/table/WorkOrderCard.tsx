
import { WorkOrder } from "../types";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ActionsMenu } from "./ActionsMenu";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatusBadgeDropdown } from "../StatusBadgeDropdown";
import { formatLocalTime } from "@/utils/dateUtils";

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

  const getCompletionStatus = (order: WorkOrder): string | undefined => {
    return order.completion_status || 
           (order.completionDetails?.data?.status) ||
           (order.completion_response?.orders?.[0]?.data?.status) ||
           (order.search_response?.scheduleInformation?.status);
  };

  const getServiceDateTime = (order: WorkOrder): string => {
    const endTime = order.completion_response?.orders?.[0]?.data?.endTime?.localTime;
    
    if (endTime) {
      return formatLocalTime(endTime, "MMM d, yyyy h:mmaaa", "N/A");
    }
    
    if (order.service_date) {
      return formatLocalTime(order.service_date, "MMM d, yyyy", "N/A");
    }
    
    if (order.end_time) {
      return formatLocalTime(order.end_time, "MMM d, yyyy h:mmaaa", "N/A");
    }
    
    return "N/A";
  };

  return (
    <Card 
      className="overflow-hidden shadow-sm hover:shadow transition-shadow cursor-pointer"
      onClick={() => onImageView(workOrder.id)}
    >
      <div className="p-3 border-b flex justify-between items-center bg-gray-50">
        <div className="font-medium">{workOrder.order_no || 'N/A'}</div>
        <div onClick={(e) => e.stopPropagation()}>
          <StatusBadgeDropdown 
            workOrderId={workOrder.id}
            currentStatus={workOrder.status || 'pending_review'} 
            completionStatus={getCompletionStatus(workOrder)}
          />
        </div>
      </div>

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
    </Card>
  );
};
