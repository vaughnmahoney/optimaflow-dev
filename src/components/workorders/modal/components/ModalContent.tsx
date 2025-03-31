
import React from "react";
import { WorkOrder } from "../../types";
import { OrderDetails } from "./OrderDetails";
import { ImageContent } from "./ImageContent";
import { ImageType } from "../../types/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ImageIcon, Clock, Check, Flag, CheckCheck, ThumbsDown, Download } from "lucide-react";
import { MobileNoteButtons } from "./MobileNoteButtons";

interface ModalContentProps {
  workOrder: WorkOrder;
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
  openMobileImageViewer?: () => void;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onDownloadAll?: () => void;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
}

export const ModalContent = ({
  workOrder,
  images,
  currentImageIndex,
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand,
  openMobileImageViewer,
  onStatusUpdate,
  onDownloadAll,
  onResolveFlag
}: ModalContentProps) => {
  const isMobile = useIsMobile();
  
  // Determine work order status
  const status = workOrder.status || "pending_review";
  const isFlagged = status === "flagged" || status === "flagged_followup";
  const isApproved = status === "approved";
  const isPending = status === "pending_review";
  const isRejected = status === "rejected";
  const isResolved = status === "resolved";
  
  // Get user action information
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
  const userActionTime = () => {
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
  
  if (isMobile) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="w-full flex-1 flex flex-col overflow-auto">
          {/* Status buttons at the top */}
          <div className="px-4 py-3 flex flex-wrap gap-2 border-b">
            {/* Current Status Button */}
            {onStatusUpdate && !isPending && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-grow"
                onClick={() => onStatusUpdate(workOrder.id, "pending_review")}
              >
                <Clock className="mr-1 h-4 w-4" />
                {isApproved ? "Approved" : isFlagged ? "Flagged" : isResolved ? "Resolved" : isRejected ? "Rejected" : "Status"}
              </Button>
            )}
            
            {/* Action buttons */}
            <div className="flex gap-2 w-full">
              {/* Approve button */}
              {onStatusUpdate && !isApproved && !isRejected && (
                <Button 
                  variant="custom"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium"
                  onClick={() => onStatusUpdate(workOrder.id, "approved")}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
              )}
              
              {/* Flag button */}
              {onStatusUpdate && !isFlagged && !isRejected && (
                <Button 
                  variant="custom"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium"
                  onClick={() => onStatusUpdate(workOrder.id, "flagged")}
                >
                  <Flag className="mr-1 h-4 w-4" />
                  Flag
                </Button>
              )}
              
              {/* Resolve button */}
              {onStatusUpdate && isFlagged && (
                <Button 
                  variant="custom"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium"
                  onClick={() => onStatusUpdate(workOrder.id, "resolved")}
                >
                  <CheckCheck className="mr-1 h-4 w-4" />
                  Resolve
                </Button>
              )}
              
              {/* Reject button */}
              {onResolveFlag && isFlagged && (
                <Button 
                  variant="custom"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium"
                  onClick={() => onResolveFlag(workOrder.id, "rejected")}
                >
                  <ThumbsDown className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              )}
              
              {/* Reopen button for rejected status */}
              {onStatusUpdate && isRejected && (
                <Button 
                  variant="custom"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
                  onClick={() => onStatusUpdate(workOrder.id, "pending_review")}
                >
                  <Clock className="mr-1 h-4 w-4" />
                  Reopen
                </Button>
              )}
            </div>
          </div>
          
          {/* User action info */}
          {userActionInfo && (
            <div className="px-4 py-2 text-sm text-gray-500 border-b">
              <div className="font-medium">{userActionInfo}</div>
              {userActionTime() && (
                <div className="text-xs">{userActionTime()}</div>
              )}
            </div>
          )}
          
          {/* Main content: Order details with buttons at the bottom */}
          <div className="flex-1 flex flex-col">
            <OrderDetails workOrder={workOrder} />
            
            {/* Action buttons at the bottom inside order details */}
            <div className="p-4 border-t bg-gray-50">
              {/* Mobile note buttons */}
              <div className="mb-4 flex gap-2">
                <MobileNoteButtons workOrder={workOrder} />
              </div>
              
              {/* Image viewer button */}
              {images.length > 0 && (
                <Button 
                  onClick={openMobileImageViewer}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white mb-3"
                >
                  <ImageIcon className="h-4 w-4" />
                  View {images.length} {images.length === 1 ? 'Image' : 'Images'}
                </Button>
              )}
              
              {/* Download button */}
              {onDownloadAll && images.length > 0 && (
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={onDownloadAll}
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download All
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop layout remains unchanged
  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left side: Image viewer */}
      <div className="w-full md:w-2/3 flex flex-col">
        <ImageContent 
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
        />
      </div>
      
      {/* Right side: Order details */}
      <div className="w-full md:w-1/3 flex flex-col border-l">
        <OrderDetails workOrder={workOrder} />
      </div>
    </div>
  );
};
