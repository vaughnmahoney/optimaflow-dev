
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, MapPin, User, MoreHorizontal, Clock } from "lucide-react";
import { StatusBadge } from "../StatusBadge";
import { WorkOrder } from "../types";
import { ActionsMenu } from "./ActionsMenu";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
}

export const WorkOrderCard = ({ workOrder, onStatusUpdate, onImageView, onDelete }: WorkOrderCardProps) => {
  // Helper functions to extract data safely
  const getLocationName = (): string => {
    if (!workOrder.location) return 'N/A';
    
    if (typeof workOrder.location === 'object') {
      return workOrder.location.name || workOrder.location.locationName || 'N/A';
    }
    
    return 'N/A';
  };

  const getDriverName = (): string => {
    if (!workOrder.driver) return 'No Driver Assigned';
    
    if (typeof workOrder.driver === 'object' && workOrder.driver.name) {
      return workOrder.driver.name;
    }
    
    return 'No Driver Name';
  };

  // Format the service date
  const getServiceDate = (): string => {
    if (workOrder.service_date) {
      try {
        return format(new Date(workOrder.service_date), "MMM d, yyyy");
      } catch (error) {
        return "N/A";
      }
    }
    return "N/A";
  };
  
  // Format the end time
  const getEndTime = (): string => {
    // First try to use the new end_time field
    if (workOrder.end_time) {
      try {
        return format(new Date(workOrder.end_time), "h:mmaaa");
      } catch (error) {
        // If parsing fails, continue to fallbacks
      }
    }
    
    // Fall back to extracting from completion_response if necessary
    const endTime = workOrder.completion_response?.orders?.[0]?.data?.endTime?.localTime;
    if (endTime) {
      try {
        return format(new Date(endTime), "h:mmaaa");
      } catch (error) {
        // If parsing fails, return N/A
      }
    }
    
    return "N/A";
  };

  // Extract the completion status
  const getCompletionStatus = (): string | undefined => {
    return workOrder.completion_status || 
           (workOrder.completionDetails?.data?.status) ||
           (workOrder.completion_response?.orders?.[0]?.data?.status) ||
           (workOrder.search_response?.scheduleInformation?.status);
  };

  return (
    <Card 
      className="overflow-hidden"
      onClick={() => onImageView(workOrder.id)}
    >
      <CardContent className="p-0">
        {/* Header row with Order # and Status */}
        <div className="flex justify-between items-center p-3 bg-muted/30 border-b">
          <div className="font-medium">{workOrder.order_no || 'N/A'}</div>
          <StatusBadge 
            status={workOrder.status || 'pending_review'} 
            completionStatus={getCompletionStatus()}
          />
        </div>
        
        {/* Content rows */}
        <div className="p-3 space-y-2">
          {/* Service Date */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{getServiceDate()}</span>
          </div>
          
          {/* End Time */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{getEndTime()}</span>
          </div>
          
          {/* Driver */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate">{getDriverName()}</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate">{getLocationName()}</span>
          </div>
        </div>
        
        {/* Actions row */}
        <div className="flex justify-end p-2 border-t bg-muted/20">
          <div onClick={(e) => e.stopPropagation()}>
            <ActionsMenu 
              workOrder={workOrder}
              onStatusUpdate={onStatusUpdate}
              onDelete={onDelete}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
