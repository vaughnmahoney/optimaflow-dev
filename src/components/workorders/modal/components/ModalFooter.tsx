
import { Button } from "@/components/ui/button";
import { Check, Download, Flag, ThumbsDown, CheckCheck, Clock } from "lucide-react";

interface ModalFooterProps {
  workOrderId: string;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onDownloadAll?: () => void;
  hasImages: boolean;
  status?: string;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
}

export const ModalFooter = ({
  workOrderId,
  onStatusUpdate,
  onDownloadAll,
  hasImages,
  status,
  onResolveFlag
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
  
  return (
    <div className="p-3 bg-white dark:bg-gray-950 border-t flex justify-between items-center">
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
