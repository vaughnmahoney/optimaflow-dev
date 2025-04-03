
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Flag, XCircle, CheckCheck, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StatusMenuItems } from "./dropdown/StatusMenuItems";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  completionStatus?: string;
  workOrderId?: string;
  disableDropdown?: boolean;
  className?: string;
}

export const StatusBadge = ({ 
  status, 
  completionStatus, 
  workOrderId, 
  disableDropdown = false,
  className 
}: StatusBadgeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { updateWorkOrderStatus } = useWorkOrderMutations();
  
  // Function to get the QC status styling
  const getQcStyling = () => {
    switch (status) {
      case "approved":
        return { icon: <Check className="h-3 w-3" />, bgColor: "bg-green-500 hover:bg-green-600" };
      case "pending_review":
        return { icon: <Clock className="h-3 w-3" />, bgColor: "bg-yellow-500 hover:bg-yellow-600" };
      case "flagged":
      case "flagged_followup":
        return { icon: <Flag className="h-3 w-3" />, bgColor: "bg-red-500 hover:bg-red-600" };
      case "resolved":
        return { icon: <CheckCheck className="h-3 w-3" />, bgColor: "bg-blue-500 hover:bg-blue-600" };
      case "rejected":
        return { icon: <AlertTriangle className="h-3 w-3" />, bgColor: "bg-orange-500 hover:bg-orange-600" };
      default:
        return { icon: <XCircle className="h-3 w-3" />, bgColor: "bg-gray-500 hover:bg-gray-600" };
    }
  };

  // Get the status label - for all statuses, display the underlying OptimoRoute status
  const getStatusLabel = () => {
    // If we have a completion status, display it (regardless of QC status)
    if (completionStatus) {
      return completionStatus.toUpperCase();
    }
    
    // Fallback to displaying the QC status if no completion status is available
    switch (status) {
      case "approved":
        return "APPROVED";
      case "pending_review":
        return "PENDING";
      case "flagged":
      case "flagged_followup":
        return "FLAGGED";
      case "resolved":
        return "RESOLVED";
      case "rejected":
        return "REJECTED";
      default:
        return "UNKNOWN";
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (workOrderId) {
      updateWorkOrderStatus(workOrderId, newStatus);
      setIsOpen(false);
    }
  };
  
  // Handle dropdown click to prevent event bubbling
  const handleDropdownClick = (e: React.MouseEvent) => {
    if (!disableDropdown && workOrderId) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Get the QC status styling
  const { icon, bgColor } = getQcStyling();

  // If dropdown is disabled or no workOrderId provided, return simple badge
  if (disableDropdown || !workOrderId) {
    return (
      <Badge 
        className={cn(`text-white font-semibold px-2.5 py-1.5 transition-colors ${bgColor} inline-flex items-center gap-1.5 rounded-full shadow-sm hover:shadow`, className)}
        title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
      >
        {icon}
        {getStatusLabel()}
      </Badge>
    );
  }
  
  // Return interactive badge with dropdown
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
        <Badge 
          className={cn(`text-white font-semibold px-2.5 py-1.5 cursor-pointer transition-colors ${bgColor} inline-flex items-center gap-1.5 rounded-full shadow-sm hover:shadow`, className)}
          title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
        >
          {icon}
          {getStatusLabel()}
          {isOpen ? (
            <ChevronUp className="h-3 w-3 ml-1 animate-fade-in" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-1 animate-fade-in" />
          )}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        onClick={handleDropdownClick} 
        className="bg-white dark:bg-gray-900 border shadow-md z-50"
      >
        <StatusMenuItems 
          currentStatus={status}
          onStatusChange={handleStatusChange}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
