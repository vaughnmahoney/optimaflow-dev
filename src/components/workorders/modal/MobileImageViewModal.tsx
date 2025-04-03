
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { useWorkOrderNavigation } from "@/hooks/useWorkOrderNavigation";
import { getStatusBorderColor } from "./utils/modalUtils";
import { MobileModalHeader } from "./components/mobile/MobileModalHeader";
import { MobileModalContent } from "./components/mobile/MobileModalContent";
import { MobileImageViewer } from "./components/mobile/MobileImageViewer";
import { MobileNavigationControls } from "./components/mobile/MobileNavigationControls";

interface MobileImageViewModalProps {
  workOrder: WorkOrder | null;
  workOrders: WorkOrder[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onNavigate: (index: number) => void;
  onPageBoundary?: (direction: 'next' | 'previous') => void;
  onDownloadAll?: () => void;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
}

export const MobileImageViewModal = ({
  workOrder,
  workOrders,
  currentIndex,
  isOpen,
  onClose,
  onStatusUpdate,
  onNavigate,
  onPageBoundary,
  onDownloadAll,
  onResolveFlag,
}: MobileImageViewModalProps) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  
  // Use a local state to track the work order to prevent unmounting
  const [localWorkOrder, setLocalWorkOrder] = useState<WorkOrder | null>(workOrder);
  
  // Update local work order when prop changes and modal is open
  useEffect(() => {
    if (isOpen && workOrder) {
      setLocalWorkOrder(workOrder);
    }
  }, [workOrder, isOpen]);
  
  const {
    currentWorkOrder,
    currentIndex: navIndex,
    currentImageIndex,
    isNavigatingPages,
    setCurrentImageIndex,
    handlePreviousOrder,
    handleNextOrder,
    handleSetOrder
  } = useWorkOrderNavigation({
    workOrders,
    initialWorkOrderId: localWorkOrder?.id || null,
    isOpen,
    onClose,
    onPageBoundary
  });
  
  // Use local work order instead of currentWorkOrder to prevent unmounting
  const modalWorkOrder = localWorkOrder || currentWorkOrder;
  
  // Early return if no work order is available
  if (!modalWorkOrder) return null;

  // Create a wrapper for status updates to update local state
  const handleStatusUpdate = (workOrderId: string, status: string) => {
    console.log("MobileImageViewModal: Updating status", workOrderId, status);
    
    // Update our local work order immediately
    if (localWorkOrder && localWorkOrder.id === workOrderId) {
      setLocalWorkOrder({
        ...localWorkOrder,
        status
      });
    }
    
    // Call the parent's handler
    if (onStatusUpdate) {
      onStatusUpdate(workOrderId, status);
    }
  };

  // Get images from the work order's completion_response
  const completionData = modalWorkOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
  // Status color for border
  const statusBorderColor = getStatusBorderColor(modalWorkOrder.status || "pending_review");

  // Sync navigation with parent component
  const handleNavigate = (index: number) => {
    handleSetOrder(index);
    onNavigate(index);
  };

  // Toggle image viewer mode
  const openImageViewer = () => setIsImageViewerOpen(true);
  const closeImageViewer = () => setIsImageViewerOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-full p-0 h-[90vh] w-[95vw] flex flex-col rounded-lg overflow-hidden border-t-4 ${statusBorderColor}`}>
        {isImageViewerOpen ? (
          // Show image viewer when in image mode
          <>
            <MobileImageViewer
              workOrderId={modalWorkOrder.id}
              images={images}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              onClose={closeImageViewer}
              onDownloadAll={onDownloadAll}
            />
          </>
        ) : (
          // Show main content when not in image mode
          <>
            <MobileModalHeader 
              workOrder={modalWorkOrder} 
              onClose={onClose} 
            />
            
            <MobileModalContent
              workOrder={modalWorkOrder}
              images={images}
              onViewImages={openImageViewer}
              onStatusUpdate={handleStatusUpdate}
              onDownloadAll={onDownloadAll}
              onResolveFlag={onResolveFlag}
            />
            
            <MobileNavigationControls 
              currentIndex={navIndex}
              totalOrders={workOrders.length}
              onPreviousOrder={handlePreviousOrder}
              onNextOrder={handleNextOrder}
              isNavigatingPages={isNavigatingPages}
              hasPreviousPage={onPageBoundary !== undefined && navIndex === 0}
              hasNextPage={onPageBoundary !== undefined && navIndex === workOrders.length - 1}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
