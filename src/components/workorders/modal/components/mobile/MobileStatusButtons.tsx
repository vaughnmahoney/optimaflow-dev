
import { Button } from "@/components/ui/button";
import { Check, Flag, CheckCheck, ThumbsDown, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MobileStatusButtonsProps {
  workOrderId: string;
  currentStatus?: string;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
  showButtons?: boolean;
}

export const MobileStatusButtons = ({
  workOrderId,
  currentStatus,
  onStatusUpdate,
  onResolveFlag,
  showButtons = false, // Hide buttons by default since we have dropdown now
}: MobileStatusButtonsProps) => {
  // If buttons are hidden, don't render anything
  if (!showButtons) return null;
  
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  // Determine if this order is in a specific state
  const isFlagged = currentStatus === "flagged" || currentStatus === "flagged_followup";
  const isResolved = currentStatus === "resolved";
  const isApproved = currentStatus === "approved";
  const isPending = currentStatus === "pending_review";
  const isRejected = currentStatus === "rejected";

  const handleStatusUpdate = async (status: string) => {
    if (!onStatusUpdate) return;
    
    try {
      setIsUpdating(true);
      await onStatusUpdate(workOrderId, status);
      
      toast.success(
        status === 'approved' 
          ? 'Work order approved successfully' 
          : status === 'flagged'
            ? 'Work order flagged for review'
            : status === 'resolved'
              ? 'Work order resolved'
              : 'Status updated successfully'
      );
    } catch (error) {
      toast.error('Failed to update work order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b flex flex-wrap justify-center gap-2">
      {/* Show approve button for non-approved orders */}
      {onStatusUpdate && !isApproved && !isRejected && (
        <Button 
          variant="custom"
          size="sm"
          disabled={isUpdating}
          className="bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors shadow-sm"
          onClick={() => handleStatusUpdate("approved")}
        >
          <Check className="mr-1 h-4 w-4" />
          Approve
        </Button>
      )}
      
      {/* Show flag button for non-flagged orders */}
      {onStatusUpdate && !isFlagged && !isRejected && (
        <Button 
          variant="custom"
          size="sm"
          disabled={isUpdating}
          className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors shadow-sm"
          onClick={() => handleStatusUpdate("flagged")}
        >
          <Flag className="mr-1 h-4 w-4" />
          Flag
        </Button>
      )}
      
      {/* Show resolve button for flagged orders */}
      {onStatusUpdate && isFlagged && (
        <Button 
          variant="custom"
          size="sm"
          disabled={isUpdating}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors shadow-sm"
          onClick={() => handleStatusUpdate("resolved")}
        >
          <CheckCheck className="mr-1 h-4 w-4" />
          Resolve
        </Button>
      )}
      
      {/* Show reject button for flagged orders */}
      {onResolveFlag && isFlagged && (
        <Button 
          variant="custom"
          size="sm"
          disabled={isUpdating}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors shadow-sm"
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
          size="sm"
          disabled={isUpdating}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md transition-colors shadow-sm"
          onClick={() => handleStatusUpdate("pending_review")}
        >
          <Clock className="mr-1 h-4 w-4" />
          Reopen
        </Button>
      )}
      
      {/* Current Status Button - always show and disabled, clicking returns to pending */}
      {onStatusUpdate && !isPending && (
        <Button 
          variant="outline" 
          size="sm"
          disabled={isUpdating}
          className="text-gray-500"
          onClick={() => handleStatusUpdate("pending_review")}
        >
          <Clock className="mr-1 h-4 w-4" />
          Reset to Pending
        </Button>
      )}
    </div>
  );
};
