
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect } from "react";
import { QcNotesSheet } from "./QcNotesSheet";
import { ResolutionNotesSheet } from "./ResolutionNotesSheet";
import { MobileStatusButton } from "./mobile/MobileStatusButton";
import { WorkOrder } from "../../types";

interface ModalFooterProps {
  workOrderId: string;
  onStatusUpdate?: (workOrderId: string, status: string, options?: any) => void;
  onDownloadAll?: () => void;
  hasImages: boolean;
  status?: string;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
  workOrder?: WorkOrder; 
}

export const ModalFooter = ({
  workOrderId,
  onStatusUpdate,
  onDownloadAll,
  hasImages,
  status,
  workOrder = {} as WorkOrder
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
  
  // Determine which attribution data to show based on current status
  const getStatusAttributionInfo = (workOrder: WorkOrder) => {
    const status = workOrder.status;
    
    if (status === "approved" && workOrder.approved_user && workOrder.approved_at) {
      return {
        user: workOrder.approved_user,
        timestamp: workOrder.approved_at
      };
    } else if ((status === "flagged" || status === "flagged_followup") && workOrder.flagged_user && workOrder.flagged_at) {
      return {
        user: workOrder.flagged_user,
        timestamp: workOrder.flagged_at
      };
    } else if (status === "resolved" && workOrder.resolved_user && workOrder.resolved_at) {
      return {
        user: workOrder.resolved_user,
        timestamp: workOrder.resolved_at
      };
    } else if (status === "rejected" && workOrder.rejected_user && workOrder.rejected_at) {
      return {
        user: workOrder.rejected_user,
        timestamp: workOrder.rejected_at
      };
    } else if (workOrder.last_action_user && workOrder.last_action_at) {
      return {
        user: workOrder.last_action_user,
        timestamp: workOrder.last_action_at
      };
    }
    
    return { user: undefined, timestamp: undefined };
  };
  
  const attributionInfo = getStatusAttributionInfo(workOrder);
  
  // Get user action information for display
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
        {/* Notes buttons */}
        <QcNotesSheet workOrder={workOrder} />
        <ResolutionNotesSheet workOrder={workOrder} />
        
        {/* Status button with attribution data */}
        <MobileStatusButton 
          workOrderId={workOrderId}
          currentStatus={status || "pending_review"}
          onStatusUpdate={onStatusUpdate}
          statusUser={attributionInfo.user}
          statusTimestamp={attributionInfo.timestamp}
        />
        
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
            size="sm" 
            className="gap-1 px-2 py-1 h-7 rounded-md bg-white border border-gray-200 hover:bg-gray-50"
            onClick={onDownloadAll}
          >
            <Download className="h-3.5 w-3.5 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Download All</span>
          </Button>
        )}
      </div>
    </div>
  );
};
