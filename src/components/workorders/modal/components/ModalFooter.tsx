
import { Button } from "@/components/ui/button";
import { Download, StickyNote, PenLine } from "lucide-react";
import { useEffect } from "react";
import { QcNotesSheet } from "./QcNotesSheet";
import { ResolutionNotesSheet } from "./ResolutionNotesSheet";

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
  onDownloadAll,
  hasImages,
  status,
  workOrder = {} // Provide default empty object
}: ModalFooterProps) => {
  // Debug logging to see what data we're receiving
  useEffect(() => {
    if (workOrder) {
      console.log('ModalFooter workOrder data:', {
        status: workOrder.status,
        flagged_user: workOrder.flagged_user,
        flagged_at: workOrder.flagged_at,
        approved_user: workOrder.approved_user,
        approved_at: workOrder.approved_at,
        resolved_user: workOrder.resolved_user,
        resolved_at: workOrder.resolved_at,
        rejected_user: workOrder.rejected_user,
        rejected_at: workOrder.rejected_at
      });
    }
  }, [workOrder]);
  
  // Get user action information with direct access and null checks
  const getUserActionInfo = () => {
    const isApproved = status === "approved";
    const isFlagged = status === "flagged" || status === "flagged_followup";
    const isResolved = status === "resolved";
    const isRejected = status === "rejected";
    
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
  const userActionTime = () => {
    const isApproved = status === "approved";
    const isFlagged = status === "flagged" || status === "flagged_followup";
    const isResolved = status === "resolved";
    const isRejected = status === "rejected";
    
    if (isApproved && workOrder?.approved_at) {
      return new Date(workOrder.approved_at).toLocaleString();
    }
    if (isFlagged && workOrder?.flagged_at) {
      return new Date(workOrder.flagged_at).toLocaleString();
    }
    if (isResolved && workOrder?.resolved_at) {
      return new Date(workOrder.resolved_at).toLocaleString();
    }
    if (isRejected && workOrder?.rejected_at) {
      return new Date(workOrder.rejected_at).toLocaleString();
    }
    return null;
  };
  
  return (
    <div className="p-3 bg-white dark:bg-gray-950 border-t flex flex-wrap justify-between items-center gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Notes buttons - added back */}
        <QcNotesSheet workOrder={workOrder} />
        <ResolutionNotesSheet workOrder={workOrder} />
        
        {/* User attribution information */}
        {userActionInfo && (
          <div className="ml-2 text-sm text-gray-500 flex flex-col">
            <span className="font-medium">{userActionInfo}</span>
            {userActionTime() && (
              <span className="text-xs">{userActionTime()}</span>
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
