
import { useState } from "react";
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
  onDownloadAll,
  onResolveFlag,
}: MobileImageViewModalProps) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  
  const {
    currentWorkOrder,
    currentIndex: navIndex,
    currentImageIndex,
    setCurrentImageIndex,
    handlePreviousOrder,
    handleNextOrder,
    handleSetOrder
  } = useWorkOrderNavigation({
    workOrders,
    initialWorkOrderId: workOrder?.id || null,
    isOpen,
    onClose
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-full p-0 h-[90vh] w-[95vw] flex flex-col rounded-lg overflow-hidden border-t-4 ${statusBorderColor}`}>
        {isImageViewerOpen ? (
          // Show image viewer when in image mode
          <>
            <MobileImageViewer
              images={images}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              onClose={closeImageViewer}
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
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
