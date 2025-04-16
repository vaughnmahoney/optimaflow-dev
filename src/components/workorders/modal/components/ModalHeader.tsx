
import { User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../../StatusBadge";
import { WorkOrder } from "../../types";

interface ModalHeaderProps {
  workOrder: WorkOrder;
  onClose: () => void;
}

export const ModalHeader = ({ 
  workOrder, 
  onClose 
}: ModalHeaderProps) => {
  const driverName = workOrder.search_response?.scheduleInformation?.driverName || 'No Driver Assigned';
  
  // Extract the completion status from the appropriate place in the order object
  const getCompletionStatus = (order: WorkOrder): string | undefined => {
    return order.completion_status || 
           (order.completionDetails?.data?.status) ||
           (order.completion_response?.orders?.[0]?.data?.status) ||
           (order.search_response?.scheduleInformation?.status);
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-950 border-b">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Order #{workOrder.order_no}</h2>
            <StatusBadge 
              status={workOrder.status || "pending_review"} 
              completionStatus={getCompletionStatus(workOrder)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Driver: {driverName}
          </p>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose} 
        className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
