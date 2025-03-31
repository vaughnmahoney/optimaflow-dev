
import { useState } from "react";
import { Check, Flag, Clock, CheckCheck, AlertTriangle, ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";

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

  // Render different menu items based on the current status
  const renderMenuItems = () => {
    switch (currentStatus) {
      case "pending_review":
        return (
          <>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("approved")}
            >
              <Check className="h-4 w-4 text-green-500" />
              <span>Approve</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("flagged")}
            >
              <Flag className="h-4 w-4 text-red-500" />
              <span>Flag</span>
            </DropdownMenuItem>
          </>
        );
      
      case "flagged":
      case "flagged_followup":
        return (
          <>
            <DropdownMenuItem 
              className="flex items-center gap-2 opacity-60 cursor-not-allowed" 
              disabled
            >
              <Flag className="h-4 w-4 text-red-500" />
              <span>Flagged</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("approved")}
            >
              <Check className="h-4 w-4 text-green-500" />
              <span>Approve</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("resolved")}
            >
              <CheckCheck className="h-4 w-4 text-blue-500" />
              <span>Resolve</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("rejected")}
            >
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Reject</span>
            </DropdownMenuItem>
          </>
        );
      
      case "approved":
        return (
          <>
            <DropdownMenuItem 
              className="flex items-center gap-2 opacity-60 cursor-not-allowed" 
              disabled
            >
              <Check className="h-4 w-4 text-green-500" />
              <span>Approved</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("pending_review")}
            >
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Mark as Pending</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("flagged")}
            >
              <Flag className="h-4 w-4 text-red-500" />
              <span>Flag</span>
            </DropdownMenuItem>
          </>
        );
      
      case "resolved":
        return (
          <>
            <DropdownMenuItem 
              className="flex items-center gap-2 opacity-60 cursor-not-allowed" 
              disabled
            >
              <CheckCheck className="h-4 w-4 text-blue-500" />
              <span>Resolved</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("approved")}
            >
              <Check className="h-4 w-4 text-green-500" />
              <span>Approve</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("flagged")}
            >
              <Flag className="h-4 w-4 text-red-500" />
              <span>Flag</span>
            </DropdownMenuItem>
          </>
        );
      
      case "rejected":
        return (
          <>
            <DropdownMenuItem 
              className="flex items-center gap-2 opacity-60 cursor-not-allowed" 
              disabled
            >
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Rejected</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("pending_review")}
            >
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Reopen</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("approved")}
            >
              <Check className="h-4 w-4 text-green-500" />
              <span>Approve</span>
            </DropdownMenuItem>
          </>
        );
      
      default:
        return (
          <>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("approved")}
            >
              <Check className="h-4 w-4 text-green-500" />
              <span>Approve</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("flagged")}
            >
              <Flag className="h-4 w-4 text-red-500" />
              <span>Flag</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleStatusChange("pending_review")}
            >
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Pending</span>
            </DropdownMenuItem>
          </>
        );
    }
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
        {renderMenuItems()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
