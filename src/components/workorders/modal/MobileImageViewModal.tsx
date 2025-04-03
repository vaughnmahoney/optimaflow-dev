
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { useWorkOrderNavigation } from "@/hooks/useWorkOrderNavigation";
import { getStatusBorderColor } from "./utils/modalUtils";
import { MobileModalHeader } from "./components/mobile/MobileModalHeader";
import { MobileModalContent } from "./components/mobile/MobileModalContent";
import { MobileImageViewer } from "./components/mobile/MobileImageViewer";
import { MobileNavigationControls } from "./components/mobile/MobileNavigationControls";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

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
    initialWorkOrderId: workOrder?.id || null,
    isOpen,
    onClose,
    onPageBoundary
  });
  
  if (!currentWorkOrder) return null;

  // Get images from the work order's completion_response
  const completionData = currentWorkOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
  // Status color for border
  const statusBorderColor = getStatusBorderColor(currentWorkOrder.status || "pending_review");

  // Sync navigation with parent component
  const handleNavigate = (index: number) => {
    handleSetOrder(index);
    onNavigate(index);
  };

  // Toggle image viewer mode
  const openImageViewer = () => setIsImageViewerOpen(true);
  const closeImageViewer = () => setIsImageViewerOpen(false);
  
  const modalTitle = `Work Order #${currentWorkOrder.order_no}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-full p-0 h-[90vh] w-[95vw] flex flex-col rounded-lg overflow-hidden border-t-4 ${statusBorderColor}`}>
        {/* Add DialogTitle for accessibility, but visually hidden */}
        <VisuallyHidden>
          <DialogTitle>{modalTitle}</DialogTitle>
        </VisuallyHidden>
      
        {isImageViewerOpen ? (
          // Show image viewer when in image mode
          <>
            <MobileImageViewer
              workOrderId={currentWorkOrder.id}
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
              workOrder={currentWorkOrder} 
              onClose={onClose} 
            />
            
            <MobileModalContent
              workOrder={currentWorkOrder}
              images={images}
              onViewImages={openImageViewer}
              onStatusUpdate={onStatusUpdate}
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
