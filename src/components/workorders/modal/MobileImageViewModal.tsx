
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { useImageViewer } from "@/hooks/useImageViewer";
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
  onStatusUpdate?: (workOrderId: string, status: string, closeModal?: boolean) => void;
  onNavigate: (index: number) => void;
  onPageBoundary?: (direction: number) => void;
  onDownloadAll?: () => void;
  onResolveFlag?: (workOrderId: string, resolution: string, closeModal?: boolean) => void;
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
  
  if (!workOrder) return null;

  // Get images from the work order's completion_response
  const completionData = workOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
  const {
    currentImageIndex,
    setCurrentImageIndex
  } = useImageViewer({
    images,
    initialIndex: 0
  });
  
  // Status color for border
  const statusBorderColor = getStatusBorderColor(workOrder.status || "pending_review");

  // Handle navigation
  const handlePreviousOrder = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else if (onPageBoundary) {
      onPageBoundary(currentIndex - 1);
    }
  };

  const handleNextOrder = () => {
    if (currentIndex < workOrders.length - 1) {
      onNavigate(currentIndex + 1);
    } else if (onPageBoundary) {
      onPageBoundary(currentIndex + 1);
    }
  };

  // Toggle image viewer mode
  const openImageViewer = () => setIsImageViewerOpen(true);
  const closeImageViewer = () => setIsImageViewerOpen(false);
  
  const isNavigatingPages = false;
  const hasPreviousPage = currentIndex === 0 && onPageBoundary !== undefined;
  const hasNextPage = currentIndex === workOrders.length - 1 && onPageBoundary !== undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-full p-0 h-[90vh] w-[95vw] flex flex-col rounded-lg overflow-hidden border-t-4 ${statusBorderColor}`}>
        {isImageViewerOpen ? (
          // Show image viewer when in image mode
          <>
            <MobileImageViewer
              workOrderId={workOrder.id}
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
              workOrder={workOrder} 
              onClose={onClose} 
            />
            
            <MobileModalContent
              workOrder={workOrder}
              images={images}
              onViewImages={openImageViewer}
              onStatusUpdate={onStatusUpdate}
              onDownloadAll={onDownloadAll}
              onResolveFlag={onResolveFlag}
            />
            
            <MobileNavigationControls 
              currentIndex={currentIndex}
              totalOrders={workOrders.length}
              onPreviousOrder={handlePreviousOrder}
              onNextOrder={handleNextOrder}
              isNavigatingPages={isNavigatingPages}
              hasPreviousPage={hasPreviousPage}
              hasNextPage={hasNextPage}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
