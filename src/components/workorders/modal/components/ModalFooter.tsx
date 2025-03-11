
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Download, 
  Flag, 
  RotateCcw, 
  ThumbsDown, 
  ThumbsUp, 
  CheckCheck, 
  RefreshCw,
  Undo
} from "lucide-react";

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
  // Determine current order states
  const isPending = status === "pending_review";
  const isApproved = status === "approved";
  const isFlagged = status === "flagged" || status === "flagged_followup";
  const isResolved = status === "resolved";
  
  // Only render buttons if we have the callback to update status
  if (!onStatusUpdate) {
    return null;
  }
  
  return (
    <div className="p-3 bg-white dark:bg-gray-950 border-t flex justify-between items-center">
      <div className="flex gap-2">
        {/* Approve button - always visible for toggling */}
        <Button 
          variant="custom"
          className={`${isApproved 
            ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300" 
            : "bg-green-500 hover:bg-green-600 text-white"} 
            font-medium rounded-md transition-colors shadow-sm`}
          onClick={() => onStatusUpdate(workOrderId, isApproved ? "pending_review" : "approved")}
        >
          <Check className="mr-1 h-4 w-4" />
          {isApproved ? "Approved ✓" : "Approve"}
        </Button>
        
        {/* Flag button - always visible except when resolved */}
        {!isResolved && (
          <Button 
            variant="custom"
            className={`${isFlagged 
              ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300" 
              : "bg-red-500 hover:bg-red-600 text-white"} 
              font-medium rounded-md transition-colors shadow-sm`}
            onClick={() => onStatusUpdate(workOrderId, isFlagged ? "pending_review" : "flagged")}
          >
            <Flag className="mr-1 h-4 w-4" />
            {isFlagged ? "Flagged ✓" : "Flag for Review"}
          </Button>
        )}
        
        {/* Resolve button - only for flagged orders */}
        {isFlagged && (
          <Button 
            variant="custom"
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-md transition-colors shadow-sm"
            onClick={() => onStatusUpdate(workOrderId, "resolved")}
          >
            <CheckCheck className="mr-1 h-4 w-4" />
            Mark as Resolved
          </Button>
        )}
        
        {/* Return to flagged button - only for resolved orders */}
        {isResolved && (
          <Button 
            variant="custom"
            className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors shadow-sm"
            onClick={() => onStatusUpdate(workOrderId, "flagged")}
          >
            <Undo className="mr-1 h-4 w-4" />
            Return to Flagged
          </Button>
        )}
        
        {/* Resolution buttons - only when flagged and onResolveFlag handler exists */}
        {onResolveFlag && isFlagged && (
          <>
            <Button 
              variant="custom"
              className="bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onResolveFlag(workOrderId, "approved")}
            >
              <ThumbsUp className="mr-1 h-4 w-4" />
              Approve Despite Flag
            </Button>
            <Button 
              variant="custom"
              className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onResolveFlag(workOrderId, "rejected")}
            >
              <ThumbsDown className="mr-1 h-4 w-4" />
              Reject Order
            </Button>
            <Button 
              variant="custom"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onResolveFlag(workOrderId, "followup")}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Request Follow-up
            </Button>
          </>
        )}
        
        {/* Resolved status indicator if order is resolved */}
        {isResolved && (
          <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md">
            <CheckCheck className="h-4 w-4" />
            <span className="font-medium text-sm">Resolved</span>
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
