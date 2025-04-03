
import { useState } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { ModalHeader } from "./components/ModalHeader";
import { ModalContent } from "./components/ModalContent";
import { ModalFooter } from "./components/ModalFooter";
import { NavigationControls } from "./components/NavigationControls";
import { getStatusBorderColor } from "./utils/modalUtils";
import { useImageViewer } from "@/hooks/useImageViewer";
import { MobileImageViewModal } from "./MobileImageViewModal";
import { useMobile } from "@/hooks/use-mobile";

interface ImageViewModalProps {
  workOrder: WorkOrder;
  workOrders: WorkOrder[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (workOrderId: string, status: string, closeModal?: boolean) => void;
  onResolveFlag?: (workOrderId: string, notes: string, closeModal?: boolean) => void;
  onNavigate: (index: number) => void;
  onPageBoundary?: (direction: number) => void;
  onDownloadAll?: () => void;
  onNextWorkOrder?: () => void;
  onPreviousWorkOrder?: () => void;
  hasNextWorkOrder?: boolean;
  hasPreviousWorkOrder?: boolean;
}

export const ImageViewModal = ({
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
  onNextWorkOrder,
  onPreviousWorkOrder,
  hasNextWorkOrder,
  hasPreviousWorkOrder,
}: ImageViewModalProps) => {
  const isMobile = useMobile();
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  
  // Extract images from the work order's completion_response
  const completionData = workOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
  const {
    currentImageIndex,
    setCurrentImageIndex,
    isImageExpanded: isExpanded,
    toggleImageExpand
  } = useImageViewer({
    images,
    initialIndex: 0
  });
  
  // Early return with mobile version
  if (isMobile) {
    return (
      <MobileImageViewModal 
        workOrder={workOrder}
        workOrders={workOrders}
        currentIndex={currentIndex}
        isOpen={isOpen}
        onClose={onClose}
        onStatusUpdate={onStatusUpdate}
        onNavigate={onNavigate}
        onPageBoundary={page => onPageBoundary && onPageBoundary(page)}
        onDownloadAll={onDownloadAll}
        onResolveFlag={onResolveFlag}
      />
    );
  }
  
  // Status color for border
  const statusBorderColor = getStatusBorderColor(workOrder.status || "pending_review");
  
  // Map the border color class to actual color hex values
  const getBorderColor = () => {
    switch (statusBorderColor) {
      case "border-green-500":
        return "#22c55e";
      case "border-red-500":
        return "#ef4444";
      case "border-yellow-500":
        return "#eab308";
      case "border-blue-500":
        return "#3b82f6";
      case "border-orange-500":
        return "#f97316";
      default:
        return "#64748b";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent className="max-w-6xl p-0 h-[90vh] flex flex-col rounded-lg overflow-hidden border-t-4 bg-white shadow-xl w-[95%] m-0" style={{ borderTopColor: getBorderColor() }}>
        <ModalHeader workOrder={workOrder} onClose={onClose} />
        
        <ModalContent
          workOrder={workOrder}
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isExpanded}
          toggleImageExpand={toggleImageExpand}
        />
        
        <ModalFooter 
          workOrderId={workOrder.id} 
          onStatusUpdate={onStatusUpdate} 
          onDownloadAll={onDownloadAll}
          hasImages={images.length > 0}
          status={workOrder.status}
          onResolveFlag={onResolveFlag}
          workOrder={workOrder}
        />
        
        <NavigationControls 
          currentIndex={currentIndex}
          totalOrders={workOrders.length}
          onPreviousOrder={onPreviousWorkOrder}
          onNextOrder={onNextWorkOrder}
          isNavigatingPages={false}
          hasPreviousPage={hasPreviousWorkOrder}
          hasNextPage={hasNextWorkOrder}
        />
      </DialogContent>
    </Dialog>
  );
};
