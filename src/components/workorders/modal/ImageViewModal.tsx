
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { ModalHeader } from "./components/ModalHeader";
import { ModalContent } from "./components/ModalContent";
import { ModalFooter } from "./components/ModalFooter";
import { NavigationControls } from "./components/NavigationControls";
import { getStatusBorderColor } from "./utils/modalUtils";
import { useWorkOrderNavigation } from "@/hooks/useWorkOrderNavigation";
import { MobileImageViewModal } from "./MobileImageViewModal";
import { useMobile } from "@/hooks/use-mobile";

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
  const isMobile = useMobile();
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  
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
  
  // Early return with mobile version, but AFTER all hooks have been called
  if (isMobile && currentWorkOrder) {
    return (
      <MobileImageViewModal 
        workOrder={currentWorkOrder}
        workOrders={workOrders}
        currentIndex={navIndex}
        isOpen={isOpen}
        onClose={onClose}
        onStatusUpdate={onStatusUpdate}
        onNavigate={onNavigate}
        onDownloadAll={onDownloadAll}
        onResolveFlag={onResolveFlag}
      />
    );
  }
  
  // Return null if no work order, but AFTER all hooks have been called
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Work Order Details</DialogTitle>
      <DialogContent className="p-0 h-[90vh] max-w-6xl w-[95vw]">
        <div className={`h-full flex flex-col rounded-lg overflow-hidden border-t-4 ${statusBorderColor} bg-white shadow-xl`}>
          <ModalHeader 
            workOrder={currentWorkOrder} 
            onClose={onClose} 
            onStatusUpdate={onStatusUpdate}
            onResolveFlag={onResolveFlag}
          />
          
          <ModalContent
            workOrder={currentWorkOrder}
            images={images}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            isImageExpanded={isImageExpanded}
            toggleImageExpand={toggleImageExpand}
          />
          
          <ModalFooter 
            workOrderId={currentWorkOrder.id} 
            onStatusUpdate={onStatusUpdate} 
            onDownloadAll={onDownloadAll}
            hasImages={images.length > 0}
            status={currentWorkOrder.status}
            onResolveFlag={onResolveFlag}
            workOrder={currentWorkOrder}
          />
          
          <NavigationControls 
            currentIndex={navIndex}
            totalOrders={workOrders.length}
            onPreviousOrder={handlePreviousOrder}
            onNextOrder={handleNextOrder}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
