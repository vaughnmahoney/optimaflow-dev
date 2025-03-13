
import { Button } from "@/components/ui/button";
import { Check, Download, Flag, ThumbsDown, CheckCheck, Clock } from "lucide-react";
import { QcNotesSheet } from "./QcNotesSheet";
import { ResolutionNotesSheet } from "./ResolutionNotesSheet";

interface ModalFooterProps {
  workOrderId: string;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onDownloadAll?: () => void;
  hasImages: boolean;
  status?: string;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
  workOrder: any; // Need to pass the full work order for notes components
}

export const ModalFooter = ({
  workOrderId,
  onStatusUpdate,
  onDownloadAll,
  hasImages,
  status,
  onResolveFlag,
  workOrder
}: ModalFooterProps) => {
  // Determine if this order is in a specific state
  const isFlagged = status === "flagged" || status === "flagged_followup";
  const isResolved = status === "resolved";
  const isApproved = status === "approved";
  const isPending = status === "pending_review";
  const isRejected = status === "rejected";
  
  // Group action buttons on the left, note actions/downloads on the right
  return (
    <div className="p-3 flex justify-between items-center gap-2">
      {/* Left side - Status action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status buttons - Flag, Approve, Resolve, etc. */}
        {onStatusUpdate && isPending && (
          <>
            <Button 
              variant="custom"
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => onStatusUpdate(workOrderId, "approved")}
            >
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
            
            <Button 
              variant="custom"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => onStatusUpdate(workOrderId, "flagged")}
            >
              <Flag className="mr-1 h-4 w-4" />
              Flag
            </Button>
          </>
        )}
        
        {/* Resolved status button */}
        {onStatusUpdate && isFlagged && (
          <Button 
            variant="custom"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => onStatusUpdate(workOrderId, "resolved")}
          >
            <CheckCheck className="mr-1 h-4 w-4" />
            Resolved
          </Button>
        )}
        
        {/* Reject button for flagged orders */}
        {onResolveFlag && isFlagged && (
          <Button 
            variant="custom"
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => onResolveFlag(workOrderId, "rejected")}
          >
            <ThumbsDown className="mr-1 h-4 w-4" />
            Flag
          </Button>
        )}
        
        {/* For rejected status, show button to reopen as pending */}
        {onStatusUpdate && isRejected && (
          <Button 
            variant="custom"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => onStatusUpdate(workOrderId, "pending_review")}
          >
            <Clock className="mr-1 h-4 w-4" />
            Reopen
          </Button>
        )}
      </div>

      {/* Right side - Notes and download actions */}
      <div className="flex items-center gap-2">
        <QcNotesSheet workOrder={workOrder} />
        <ResolutionNotesSheet workOrder={workOrder} />
        
        {onDownloadAll && hasImages && (
          <Button 
            variant="outline"
            className="border-gray-300 hover:bg-gray-100"
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
