
import { WorkOrder } from "../types";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { ActionsMenu } from "./ActionsMenu";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatusBadgeDropdown } from "../StatusBadgeDropdown";

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
      try {
        const date = new Date(endTime);
        if (!isNaN(date.getTime())) {
          return format(date, "MMM d, yyyy h:mmaaa");
        }
      } catch (error) {
        console.error("Error formatting end date:", error);
      }
    }
    
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
    <Card 
      className="overflow-hidden shadow hover:shadow-md transition-all duration-200 cursor-pointer transform hover:translate-y-[-2px] border border-border/40"
      onClick={() => onImageView(workOrder.id)}
    >
      <div className="p-3 border-b border-border/60 flex justify-between items-center bg-card/60">
        <div className="font-medium text-sm truncate">{workOrder.order_no || 'N/A'}</div>
        <div onClick={(e) => e.stopPropagation()} className="z-10">
          <StatusBadgeDropdown 
            workOrderId={workOrder.id}
            currentStatus={workOrder.status || 'pending_review'} 
            completionStatus={getCompletionStatus(workOrder)}
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="text-sm flex justify-between items-start">
          <span className="text-muted-foreground whitespace-nowrap mr-2">Driver:</span>
          <span className="text-right font-medium max-w-[70%] break-words">{getDriverName(workOrder)}</span>
        </div>
        <div className="text-sm flex justify-between items-start">
          <span className="text-muted-foreground whitespace-nowrap mr-2">Location:</span>
          <span className="text-right font-medium max-w-[70%] break-words">{getLocationName(workOrder)}</span>
        </div>
        <div className="text-sm flex justify-between items-start">
          <span className="text-muted-foreground whitespace-nowrap mr-2">Date:</span>
          <span className="text-right font-medium">{getServiceDateTime(workOrder)}</span>
        </div>
      </div>
    </Card>
  );
};
