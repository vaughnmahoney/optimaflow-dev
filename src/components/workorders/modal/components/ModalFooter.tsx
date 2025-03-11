
import { Button } from "@/components/ui/button";
import { Check, Download, Flag, RotateCcw, ThumbsDown, ThumbsUp, CheckCheck } from "lucide-react";

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
  // Determine if this order is in a flagged state
  const isFlagged = status === "flagged" || status === "flagged_followup";
  const isResolved = status === "resolved";
  
  return (
    <div className="p-3 bg-white dark:bg-gray-950 border-t flex justify-between items-center">
      <div className="flex gap-2">
        {/* Show approve/flag buttons only for pending review orders */}
        {onStatusUpdate && !isFlagged && !isResolved && (
          <>
            <Button 
              variant="custom"
              className="bg-[#6CAE75] hover:bg-[#5a9361] text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onStatusUpdate(workOrderId, "approved")}
            >
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button 
              variant="custom"
              className="bg-[#ea384c] hover:bg-[#d32f3f] text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onStatusUpdate(workOrderId, "flagged")}
            >
              <Flag className="mr-1 h-4 w-4" />
              Flag for Review
            </Button>
          </>
        )}
        
        {/* Show resolution buttons only for flagged orders */}
        {onResolveFlag && isFlagged && (
          <>
            <Button 
              variant="custom"
              className="bg-[#6CAE75] hover:bg-[#5a9361] text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onResolveFlag(workOrderId, "approved")}
            >
              <ThumbsUp className="mr-1 h-4 w-4" />
              Approve Despite Flag
            </Button>
            <Button 
              variant="custom"
              className="bg-[#ea384c] hover:bg-[#d32f3f] text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onResolveFlag(workOrderId, "rejected")}
            >
              <ThumbsDown className="mr-1 h-4 w-4" />
              Reject Order
            </Button>
            <Button 
              variant="custom"
              className="bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onResolveFlag(workOrderId, "followup")}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Request Follow-up
            </Button>
            <Button 
              variant="custom"
              className="bg-[#9b87f5] hover:bg-[#8b5cf6] text-white font-medium rounded-md transition-colors shadow-sm"
              onClick={() => onStatusUpdate(workOrderId, "resolved")}
            >
              <CheckCheck className="mr-1 h-4 w-4" />
              Mark as Resolved
            </Button>
          </>
        )}
        
        {/* Show resolved status indicator if the order is resolved */}
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
