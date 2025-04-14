
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { WorkOrder } from "../types";
import { formatLocalTime } from "@/utils/dateUtils";

interface TechWorkOrderRowProps {
  workOrder: WorkOrder;
  onImageView: (workOrderId: string) => void;
  onAddNotes: (workOrderId: string) => void;
}

export const TechWorkOrderRow = ({ 
  workOrder, 
  onImageView, 
  onAddNotes 
}: TechWorkOrderRowProps) => {
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
          <Button 
            variant="ghost" 
            size="icon"
            title="Add/Edit Notes"
            onClick={(e) => {
              e.stopPropagation();
              onAddNotes(workOrder.id);
            }}
            className="h-8 w-8"
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
