
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, Flag, XCircle, CheckCheck, AlertTriangle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

interface StatusBadgeDropdownProps {
  status: string;
  completionStatus?: string;
  workOrderId?: string; 
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
}

export const StatusBadgeDropdown = ({ 
  status, 
  completionStatus, 
  workOrderId, 
  onStatusUpdate,
  onResolveFlag
}: StatusBadgeDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Function to get the QC status styling
  const getQcStyling = () => {
    switch (status) {
      case "approved":
        return { icon: <Check className="h-3 w-3" />, bgColor: "bg-green-500 hover:bg-green-600" };
      case "pending_review":
        return { icon: <AlertTriangle className="h-3 w-3" />, bgColor: "bg-yellow-500 hover:bg-yellow-600" };
      case "flagged":
      case "flagged_followup":
        return { icon: <Flag className="h-3 w-3" />, bgColor: "bg-red-500 hover:bg-red-600" };
      case "resolved":
        return { icon: <CheckCheck className="h-3 w-3" />, bgColor: "bg-blue-500 hover:bg-blue-600" };
      case "rejected":
        return { icon: <XCircle className="h-3 w-3" />, bgColor: "bg-orange-500 hover:bg-orange-600" };
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

  // Only show dropdown if we have functions to update status
  const isInteractive = Boolean(workOrderId && (onStatusUpdate || onResolveFlag));

  // Handle status update
  const handleStatusUpdate = (newStatus: string) => {
    if (!workOrderId || !onStatusUpdate) return;
    onStatusUpdate(workOrderId, newStatus);
    setIsOpen(false);
  };

  // Handle flag resolution
  const handleResolveFlag = (resolution: string) => {
    if (!workOrderId || !onResolveFlag) return;
    onResolveFlag(workOrderId, resolution);
    setIsOpen(false);
  };

  // Get the QC status styling
  const { icon, bgColor } = getQcStyling();

  // Generate dropdown items based on current status
  const getDropdownItems = () => {
    if (!isInteractive) return null;

    switch (status) {
      case "pending_review":
        return (
          <>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleStatusUpdate("approved")}
            >
              <Check className="h-4 w-4 text-green-600" />
              <span>Approve</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleStatusUpdate("flagged")}
            >
              <Flag className="h-4 w-4 text-red-600" />
              <span>Flag for Review</span>
            </DropdownMenuItem>
          </>
        );
      case "flagged":
      case "flagged_followup":
        return (
          <>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleResolveFlag("approved")}
            >
              <Check className="h-4 w-4 text-green-600" />
              <span>Approve</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleStatusUpdate("resolved")}
            >
              <CheckCheck className="h-4 w-4 text-blue-600" />
              <span>Resolve</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleResolveFlag("rejected")}
            >
              <XCircle className="h-4 w-4 text-orange-600" />
              <span>Reject</span>
            </DropdownMenuItem>
          </>
        );
      case "resolved":
      case "approved":
        return (
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleStatusUpdate("pending_review")}
          >
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span>Reset to Pending</span>
          </DropdownMenuItem>
        );
      case "rejected":
        return (
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleStatusUpdate("pending_review")}
          >
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span>Reopen</span>
          </DropdownMenuItem>
        );
      default:
        return null;
    }
  };

  // If there's no interaction capability, render the standard badge
  if (!isInteractive) {
    return (
      <Badge 
        className={`text-white font-semibold px-2.5 py-1.5 transition-colors ${bgColor} inline-flex items-center gap-1.5 rounded-full shadow-sm hover:shadow`}
        title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
      >
        {icon}
        {getStatusLabel()}
      </Badge>
    );
  }

  // Interactive version with dropdown
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Badge 
          className={`text-white font-semibold px-2.5 py-1.5 transition-colors ${bgColor} 
            inline-flex items-center gap-1.5 rounded-full shadow-sm hover:shadow cursor-pointer`}
          title={`QC Status: ${status.replace(/_/g, " ").toUpperCase()}`}
        >
          {icon}
          {getStatusLabel()}
          <ChevronDown className="h-3 w-3 ml-0.5" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="bg-white shadow-lg rounded-md p-1 min-w-40 z-50">
        {getDropdownItems()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
