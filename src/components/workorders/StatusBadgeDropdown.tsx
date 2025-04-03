
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { StatusMenuItems } from "./dropdown/StatusMenuItems";
import { toast } from "sonner";

interface StatusBadgeDropdownProps {
  workOrderId: string;
  currentStatus: string;
  completionStatus?: string;
  className?: string;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
}

export const StatusBadgeDropdown = ({ 
  workOrderId, 
  currentStatus, 
  completionStatus,
  className,
  onStatusUpdate
}: StatusBadgeDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate(workOrderId, newStatus);
    setIsOpen(false);
    toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
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
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
