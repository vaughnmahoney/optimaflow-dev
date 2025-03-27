
import { Button } from "@/components/ui/button";
import { Check, Download, Flag, ThumbsDown, CheckCheck, Clock, Info } from "lucide-react";

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

  // Determine which attribution data to use based on status
  const getAttributionData = () => {
    if (isApproved) {
      return {
        user: workOrder?.approved_user,
        timestamp: workOrder?.approved_at,
        action: "Approved"
      };
    }
    if (isFlagged) {
      return {
        user: workOrder?.flagged_user,
        timestamp: workOrder?.flagged_at,
        action: "Flagged"
      };
    }
    if (isResolved) {
      return {
        user: workOrder?.resolved_user,
        timestamp: workOrder?.resolved_at,
        action: "Resolved"
      };
    }
    if (isRejected) {
      return {
        user: workOrder?.rejected_user,
        timestamp: workOrder?.rejected_at,
        action: "Rejected"
      };
    }
    // Default case for other statuses
    return {
      user: workOrder?.last_action_user,
      timestamp: workOrder?.last_action_at,
      action: "Last action"
    };
  };
  
  // Get attribution information
  const attribution = getAttributionData();
  const hasAttribution = attribution && attribution.user && attribution.timestamp;
  
  // Format timestamp if exists
  const formattedTime = attribution.timestamp 
    ? new Date(attribution.timestamp).toLocaleString() 
    : null;
  
  return (
    <div className="p-3 bg-white dark:bg-gray-950 border-t flex flex-wrap justify-between items-center gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Action Buttons Section */}
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
        
        {/* User attribution information - directly next to the buttons */}
        {hasAttribution && (
          <div className="ml-2 text-sm text-gray-500 border-l border-gray-200 pl-2 flex flex-col">
            <span className="font-medium">{`${attribution.action} by ${attribution.user}`}</span>
            {formattedTime && (
              <span className="text-xs">{formattedTime}</span>
            )}
          </div>
        )}
      </div>

      <div>
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
