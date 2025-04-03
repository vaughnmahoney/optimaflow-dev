
import { X } from "lucide-react";
import { WorkOrder } from "../../types";
import { StatusBadge } from "../../StatusBadge";
import { Button } from "@/components/ui/button";

interface ModalHeaderProps {
  workOrder: WorkOrder;
  onClose: () => void;
}

export const ModalHeader = ({ workOrder, onClose }: ModalHeaderProps) => {
  // Extract the completion status from the appropriate place in the order object
  const getCompletionStatus = (order: WorkOrder): string | undefined => {
    return order.completion_status || 
           (order.completionDetails?.data?.status) ||
           (order.completion_response?.orders?.[0]?.data?.status) ||
           (order.search_response?.scheduleInformation?.status);
  };

  return (
    <div className="flex justify-between items-center p-4 border-b bg-gray-50">
      <div className="flex items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Order #{workOrder.order_no || 'Unknown'}</h3>
          <div className="text-sm text-muted-foreground mt-1">
            {workOrder.location && typeof workOrder.location === 'object' && 
              (workOrder.location.name || workOrder.location.locationName || 'Unknown Location')}
          </div>
        </div>
        <StatusBadge 
          status={workOrder.status || 'pending_review'} 
          completionStatus={getCompletionStatus(workOrder)} 
          disableDropdown={true} 
        />
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  );
};
