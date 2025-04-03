
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
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
    setIsNavigatingPages,
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

  // Create a wrapper for status updates to update local state
  const handleStatusUpdate = (workOrderId: string, status: string) => {
    console.log("ImageViewModal: Updating status", workOrderId, status);
    
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
  
  // Early return with mobile version, but AFTER all hooks have been called
  if (isMobile && localWorkOrder) {
    return (
      <MobileImageViewModal 
        workOrder={localWorkOrder}
        workOrders={workOrders}
        currentIndex={navIndex}
        isOpen={isOpen}
        onClose={onClose}
        onStatusUpdate={handleStatusUpdate}
        onNavigate={onNavigate}
        onPageBoundary={onPageBoundary}
        onDownloadAll={onDownloadAll}
        onResolveFlag={onResolveFlag}
      />
    );
  }
  
  // Use local work order instead of currentWorkOrder to prevent unmounting
  const modalWorkOrder = localWorkOrder || currentWorkOrder;
  
  // Return null if no work order, but AFTER all hooks have been called
  if (!modalWorkOrder) return null;

  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };

  // Get images from the work order's completion_response
  const completionData = modalWorkOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
  // Status color for border
  const statusBorderColor = getStatusBorderColor(modalWorkOrder.status || "pending_review");
  
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent className="max-w-6xl p-0 h-[90vh] flex flex-col rounded-lg overflow-hidden border-t-4 bg-white shadow-xl w-[95%] m-0" style={{ borderTopColor: getBorderColor() }}>
        <ModalHeader workOrder={modalWorkOrder} onClose={onClose} />
        
        <ModalContent
          workOrder={modalWorkOrder}
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
        />
        
        <ModalFooter 
          workOrderId={modalWorkOrder.id} 
          onStatusUpdate={handleStatusUpdate}
          onDownloadAll={onDownloadAll}
          hasImages={images.length > 0}
          status={modalWorkOrder.status}
          onResolveFlag={onResolveFlag}
          workOrder={modalWorkOrder}
        />
        
        <NavigationControls 
          currentIndex={navIndex}
          totalOrders={workOrders.length}
          onPreviousOrder={handlePreviousOrder}
          onNextOrder={handleNextOrder}
          isNavigatingPages={isNavigatingPages}
          hasPreviousPage={onPageBoundary !== undefined && navIndex === 0}
          hasNextPage={onPageBoundary !== undefined && navIndex === workOrders.length - 1}
        />
      </DialogContent>
    </Dialog>
  );
};
