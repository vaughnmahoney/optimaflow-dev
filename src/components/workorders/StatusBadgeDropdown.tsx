
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { StatusMenuItems } from "./dropdown/StatusMenuItems";

interface StatusBadgeDropdownProps {
  workOrderId: string;
  currentStatus: string;
  completionStatus?: string;
  className?: string;
}

export const StatusBadgeDropdown = ({ 
  workOrderId, 
  currentStatus, 
  completionStatus,
  className 
}: StatusBadgeDropdownProps) => {
  const { updateWorkOrderStatus } = useWorkOrderMutations();
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    updateWorkOrderStatus(workOrderId, newStatus);
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
          {isOpen ? (
            <ChevronUp className="h-3 w-3 text-white bg-inherit transition-transform duration-300" />
          ) : (
            <ChevronDown className="h-3 w-3 text-white bg-inherit transition-transform duration-300" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        onClick={handleDropdownClick} 
        className="bg-white dark:bg-gray-900 border shadow-md z-50"
      >
        <StatusMenuItems 
          currentStatus={currentStatus}
          onStatusChange={handleStatusChange}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
