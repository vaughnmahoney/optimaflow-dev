
import { useState, useEffect } from "react";
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
import { VisuallyHidden } from "@/components/ui/visually-hidden";

interface ImageViewModalProps {
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
}: ImageViewModalProps) => {
  const isMobile = useMobile();
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  
  // For debugging
  useEffect(() => {
    console.log("ImageViewModal render", { isOpen, workOrderId: workOrder?.id });
  }, [isOpen, workOrder]);
  
  const {
    currentWorkOrder,
    currentIndex: navIndex,
    currentImageIndex,
    isNavigatingPages,
    setCurrentImageIndex,
    setIsNavigatingPages,
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
  
  // Early return with mobile version, but AFTER all hooks have been called
  if (isMobile && workOrder) {
    return (
      <MobileImageViewModal 
        workOrder={workOrder}
        workOrders={workOrders}
        currentIndex={currentIndex}
        isOpen={isOpen}
        onClose={onClose}
        onStatusUpdate={onStatusUpdate}
        onNavigate={onNavigate}
        onPageBoundary={onPageBoundary}
        onDownloadAll={onDownloadAll}
        onResolveFlag={onResolveFlag}
      />
    );
  }
  
  // Return null if no work order, but AFTER all hooks have been called
  if (!workOrder) return null;

  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };

  // Get images from the work order's completion_response
  const completionData = workOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
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

  // Sync navigation with parent component
  const handleNavigate = (index: number) => {
    handleSetOrder(index);
    onNavigate(index);
  };

  const modalTitle = `Work Order #${workOrder.order_no}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-6xl p-0 h-[90vh] flex flex-col rounded-lg overflow-hidden border-t-4 bg-white shadow-xl w-[95%] m-0" style={{ borderTopColor: getBorderColor() }}>
        {/* Add DialogTitle for accessibility, but visually hidden */}
        <VisuallyHidden>
          <DialogTitle>{modalTitle}</DialogTitle>
        </VisuallyHidden>
        
        <ModalHeader workOrder={workOrder} onClose={onClose} />
        
        <ModalContent
          workOrder={workOrder}
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
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
          currentIndex={currentIndex === -1 ? navIndex : currentIndex}
          totalOrders={workOrders.length}
          onPreviousOrder={handlePreviousOrder}
          onNextOrder={handleNextOrder}
          isNavigatingPages={isNavigatingPages}
          hasPreviousPage={onPageBoundary !== undefined && (currentIndex === -1 ? navIndex === 0 : currentIndex === 0)}
          hasNextPage={onPageBoundary !== undefined && (currentIndex === -1 ? navIndex === workOrders.length - 1 : currentIndex === workOrders.length - 1)}
        />
      </DialogContent>
    </Dialog>
  );
};
