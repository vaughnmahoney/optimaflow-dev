
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { ModalHeader } from "./components/ModalHeader";
import { ModalContent } from "./components/ModalContent";
import { ModalFooter } from "./components/ModalFooter";
import { NavigationControls } from "./components/NavigationControls";
import { getStatusBorderColor } from "./utils/modalUtils";
import { useWorkOrderNavigation } from "@/hooks/useWorkOrderNavigation";
import { MobileImageViewerModal } from "./MobileImageViewerModal";
import { useIsMobile } from "@/hooks/use-mobile";

interface ImageViewModalProps {
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

export const ImageViewModal = ({
  workOrder,
  workOrders,
  currentIndex,
  isOpen,
  onClose,
  onStatusUpdate,
  onNavigate,
  onDownloadAll,
  onResolveFlag,
}: ImageViewModalProps) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isMobileImageViewerOpen, setIsMobileImageViewerOpen] = useState(false);
  const isMobile = useIsMobile();
  
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

  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`max-w-6xl p-0 h-[90vh] flex flex-col rounded-lg overflow-hidden border-t-4 ${statusBorderColor}`}>
          <ModalHeader workOrder={currentWorkOrder} onClose={onClose} />
          
          <ModalContent
            workOrder={currentWorkOrder}
            images={images}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            isImageExpanded={isImageExpanded}
            toggleImageExpand={toggleImageExpand}
            openMobileImageViewer={() => setIsMobileImageViewerOpen(true)}
            onStatusUpdate={onStatusUpdate}
            onDownloadAll={onDownloadAll}
            onResolveFlag={onResolveFlag}
          />
          
          {!isMobile && (
            <ModalFooter 
              workOrderId={currentWorkOrder.id} 
              onStatusUpdate={onStatusUpdate} 
              onDownloadAll={onDownloadAll}
              hasImages={images.length > 0}
              status={currentWorkOrder.status}
              onResolveFlag={onResolveFlag}
              workOrder={currentWorkOrder}
            />
          )}
          
          <NavigationControls 
            currentIndex={navIndex}
            totalOrders={workOrders.length}
            onPreviousOrder={handlePreviousOrder}
            onNextOrder={handleNextOrder}
          />
        </DialogContent>
      </Dialog>
      
      {/* Mobile image viewer modal */}
      {isMobile && (
        <MobileImageViewerModal 
          isOpen={isMobileImageViewerOpen}
          onClose={() => setIsMobileImageViewerOpen(false)}
          images={images}
          initialImageIndex={currentImageIndex}
        />
      )}
    </>
  );
};
