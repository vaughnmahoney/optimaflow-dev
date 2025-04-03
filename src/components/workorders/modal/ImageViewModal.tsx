
import { useState } from "react";
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
import { useLocalWorkOrderState } from "@/hooks/useLocalWorkOrderState";
import { useQueryClient } from "@tanstack/react-query";

interface ImageViewModalProps {
  workOrder: WorkOrder | null;
  workOrders: WorkOrder[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (workOrderId: string, status: string, options?: any) => void;
  onNavigate: (index: number) => void;
  onPageBoundary?: (direction: 'next' | 'previous') => void;
  onDownloadAll?: () => void;
  onResolveFlag?: (workOrderId: string, resolution: string, options?: any) => void;
  filters?: any;
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
  filters
}: ImageViewModalProps) => {
  const isMobile = useMobile();
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const queryClient = useQueryClient();
  
  const {
    currentWorkOrder: navigationWorkOrder,
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
  
  // Use our new hook to manage local work order state
  const {
    localWorkOrder,
    handleStatusUpdate: handleLocalStatusUpdate,
    handleResolveFlag: handleLocalResolveFlag,
    handleClose: handleLocalClose,
    hasLocalChanges
  } = useLocalWorkOrderState({
    initialWorkOrder: navigationWorkOrder,
    onStatusUpdate,
    onResolveFlag,
    onClose: () => {
      // Refresh queries when closing to update filter lists
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
      onClose();
    }
  });
  
  // Early return with mobile version, but AFTER all hooks have been called
  if (isMobile && localWorkOrder) {
    return (
      <MobileImageViewModal 
        workOrder={localWorkOrder}
        workOrders={workOrders}
        currentIndex={navIndex}
        isOpen={isOpen}
        onClose={handleLocalClose}
        onStatusUpdate={handleLocalStatusUpdate}
        onNavigate={onNavigate}
        onPageBoundary={onPageBoundary}
        onDownloadAll={onDownloadAll}
        onResolveFlag={handleLocalResolveFlag}
        filters={filters}
      />
    );
  }
  
  // Return null if no work order, but AFTER all hooks have been called
  if (!localWorkOrder) return null;

  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };

  // Get images from the work order's completion_response
  const completionData = localWorkOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
  // Status color for border
  const statusBorderColor = getStatusBorderColor(localWorkOrder.status || "pending_review");
  
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

  // Custom navigation handler that refreshes queries before navigating
  const handleNavigate = (index: number) => {
    // If we have local changes, refresh the queries before navigating
    if (hasLocalChanges.current) {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
    }
    
    handleSetOrder(index);
    onNavigate(index);
  };
  
  // Handle advancement to next order when current order is filtered out
  const handleAdvanceToNextOrder = (nextOrderId: string) => {
    // Find the index of the next order
    const nextIndex = workOrders.findIndex(wo => wo.id === nextOrderId);
    if (nextIndex !== -1) {
      handleNavigate(nextIndex);
    }
  };

  // Custom close handler to invalidate queries if needed
  const modalCloseHandler = () => {
    handleLocalClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={modalCloseHandler}>
      <DialogOverlay />
      <DialogContent className="max-w-6xl p-0 h-[90vh] flex flex-col rounded-lg overflow-hidden border-t-4 bg-white shadow-xl w-[95%] m-0" style={{ borderTopColor: getBorderColor() }}>
        <ModalHeader 
          workOrder={localWorkOrder} 
          onClose={modalCloseHandler} 
          filters={filters}
          workOrders={workOrders}
          onAdvanceToNextOrder={handleAdvanceToNextOrder}
        />
        
        <ModalContent
          workOrder={localWorkOrder}
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
        />
        
        <ModalFooter 
          workOrderId={localWorkOrder.id} 
          onStatusUpdate={handleLocalStatusUpdate} 
          onDownloadAll={onDownloadAll}
          hasImages={images.length > 0}
          status={localWorkOrder.status}
          onResolveFlag={handleLocalResolveFlag}
          workOrder={localWorkOrder}
        />
        
        <NavigationControls 
          currentIndex={navIndex}
          totalOrders={workOrders.length}
          onPreviousOrder={() => {
            // If we have local changes, refresh the queries before navigating
            if (hasLocalChanges.current) {
              queryClient.invalidateQueries({ queryKey: ["workOrders"] });
              queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
            }
            handlePreviousOrder();
          }}
          onNextOrder={() => {
            // If we have local changes, refresh the queries before navigating
            if (hasLocalChanges.current) {
              queryClient.invalidateQueries({ queryKey: ["workOrders"] });
              queryClient.invalidateQueries({ queryKey: ["flaggedWorkOrdersCount"] });
            }
            handleNextOrder();
          }}
          isNavigatingPages={isNavigatingPages}
          hasPreviousPage={onPageBoundary !== undefined && navIndex === 0}
          hasNextPage={onPageBoundary !== undefined && navIndex === workOrders.length - 1}
        />
      </DialogContent>
    </Dialog>
  );
};
