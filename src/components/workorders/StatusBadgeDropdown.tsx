
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { StatusMenuItems } from "./dropdown/StatusMenuItems";
import { useQueryClient } from "@tanstack/react-query";
import { WorkOrder } from "./types";

interface StatusBadgeDropdownProps {
  workOrderId: string;
  currentStatus: string;
  completionStatus?: string;
  className?: string;
  filters?: any;
  workOrders?: any[];
  onAdvanceToNextOrder?: (nextOrderId: string) => void;
  workOrder?: WorkOrder;
}

export const StatusBadgeDropdown = ({ 
  workOrderId, 
  currentStatus, 
  completionStatus,
  className,
  filters,
  workOrders,
  onAdvanceToNextOrder,
  workOrder
}: StatusBadgeDropdownProps) => {
  const { updateWorkOrderStatus } = useWorkOrderMutations();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleStatusChange = (newStatus: string) => {
    // Include skipRefresh: true to prevent automatic filtering
    // And updateLocal: true to update the UI status immediately
    const options = { 
      skipRefresh: true,
      updateLocal: true,
      ...(filters && workOrders && onAdvanceToNextOrder ? { filters, workOrders, onAdvanceToNextOrder } : {})
    };
    
    updateWorkOrderStatus(workOrderId, newStatus, options);
    
    // Keep the badge count updated separately for sidebar accuracy
    queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
    
    setIsOpen(false);
  };
  
  const handleDropdownClick = (e: React.MouseEvent) => {
    // Prevent event from bubbling up to parent elements
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
        <div className={cn("flex items-center gap-1 cursor-pointer", className)}>
          <StatusBadge 
            status={currentStatus} 
            completionStatus={completionStatus} 
          />
          <ChevronDown className="h-3 w-3 text-white" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        onClick={handleDropdownClick} 
        className="bg-white dark:bg-gray-900 border shadow-md z-50"
      >
        <StatusMenuItems 
          currentStatus={currentStatus}
          onStatusChange={handleStatusChange}
          workOrder={workOrder}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
