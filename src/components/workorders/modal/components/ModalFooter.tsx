
import { Button } from "@/components/ui/button";
import { Check, Download, Flag, ThumbsDown, CheckCheck, Clock, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModalFooterProps {
  workOrderId: string;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onDownloadAll?: () => void;
  hasImages: boolean;
  status?: string;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
  workOrder?: any; // Make workOrder optional
}

export const ModalFooter = ({
  workOrderId,
  onStatusUpdate,
  onDownloadAll,
  hasImages,
  status,
  onResolveFlag,
  workOrder = {} // Provide default empty object
}: ModalFooterProps) => {
  // Determine if this order is in a specific state
  const isFlagged = status === "flagged" || status === "flagged_followup";
  const isResolved = status === "resolved";
  const isApproved = status === "approved";
  const isPending = status === "pending_review";
  const isRejected = status === "rejected";
  
  // Get status-specific styling for the disabled status button
  const getStatusButtonStyle = () => {
    if (isApproved) return "bg-green-50 text-green-700 border-green-200";
    if (isFlagged) return "bg-red-50 text-red-700 border-red-200";
    if (isResolved) return "bg-blue-50 text-blue-700 border-blue-200";
    if (isRejected) return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-gray-100 text-gray-500";
  };

  // Get user action information with null checks
  const getUserActionInfo = () => {
    if (isApproved && workOrder?.approved_user) {
      return `Approved by ${workOrder.approved_user}`;
    }
    if (isFlagged && workOrder?.flagged_user) {
      return `Flagged by ${workOrder.flagged_user}`;
    }
    if (isResolved && workOrder?.resolved_user) {
      return `Resolved by ${workOrder.resolved_user}`;
    }
    if (isRejected && workOrder?.rejected_user) {
      return `Rejected by ${workOrder.rejected_user}`;
    }
    return null;
  };
  
  const userActionInfo = getUserActionInfo();
  
  return (
    <div className="p-3 bg-white dark:bg-gray-950 border-t flex flex-wrap justify-between items-center gap-2">
      <div className="flex gap-2 flex-wrap">
        {/* Current Status Button - always show and disabled, clicking returns to pending */}
        {onStatusUpdate && !isPending && (
          <Button 
            variant="outline" 
            className={`${getStatusButtonStyle()} cursor-pointer`}
            onClick={() => onStatusUpdate(workOrderId, "pending_review")}
          >
            <Clock className="mr-1 h-4 w-4" />
            {isApproved ? "Approved" : isFlagged ? "Flagged" : isResolved ? "Resolved" : isRejected ? "Rejected" : "Status"}
          </Button>
        )}
        
        {/* Show approve button for non-approved orders */}
        {onStatusUpdate && !isApproved && !isRejected && (
          <Button 
            variant="custom"
            className="bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors shadow-sm"
            onClick={() => onStatusUpdate(workOrderId, "approved")}
          >
            <Check className="mr-1 h-4 w-4" />
            Approve
          </Button>
        )}
        
        {/* Show flag button for non-flagged orders */}
        {onStatusUpdate && !isFlagged && !isRejected && (
          <Button 
            variant="custom"
            className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors shadow-sm"
            onClick={() => onStatusUpdate(workOrderId, "flagged")}
          >
            <Flag className="mr-1 h-4 w-4" />
            Flag
          </Button>
        )}
        
        {/* Show resolve button for flagged orders */}
        {onStatusUpdate && isFlagged && (
          <Button 
            variant="custom"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors shadow-sm"
            onClick={() => onStatusUpdate(workOrderId, "resolved")}
          >
            <CheckCheck className="mr-1 h-4 w-4" />
            Resolve
          </Button>
        )}
        
        {/* Show reject button for flagged orders */}
        {onResolveFlag && isFlagged && (
          <Button 
            variant="custom"
            className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors shadow-sm"
            onClick={() => onResolveFlag(workOrderId, "rejected")}
          >
            <ThumbsDown className="mr-1 h-4 w-4" />
            Reject
          </Button>
        )}
        
        {/* For rejected status, show button to reopen as pending */}
        {onStatusUpdate && isRejected && (
          <Button 
            variant="custom"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md transition-colors shadow-sm"
            onClick={() => onStatusUpdate(workOrderId, "pending_review")}
          >
            <Clock className="mr-1 h-4 w-4" />
            Reopen
          </Button>
        )}
      </div>

      <div className="flex gap-2 items-center">
        {/* User footprint information with tooltip */}
        {userActionInfo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">{userActionInfo}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{userActionInfo}</p>
                {workOrder?.approved_at && isApproved && 
                  <p className="text-xs">on {new Date(workOrder.approved_at).toLocaleString()}</p>
                }
                {workOrder?.flagged_at && isFlagged && 
                  <p className="text-xs">on {new Date(workOrder.flagged_at).toLocaleString()}</p>
                }
                {workOrder?.resolved_at && isResolved && 
                  <p className="text-xs">on {new Date(workOrder.resolved_at).toLocaleString()}</p>
                }
                {workOrder?.rejected_at && isRejected && 
                  <p className="text-xs">on {new Date(workOrder.rejected_at).toLocaleString()}</p>
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {onDownloadAll && hasImages && (
          <Button 
            variant="outline"
            className="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 font-medium rounded-md transition-colors shadow-sm"
            onClick={onDownloadAll}
          >
            <Download className="mr-1 h-4 w-4" />
            Download All
          </Button>
        )}
      </div>
    </div>
  );
};
