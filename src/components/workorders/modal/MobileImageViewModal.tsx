
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { useWorkOrderNavigation } from "@/hooks/useWorkOrderNavigation";
import { getStatusBorderColor } from "./utils/modalUtils";
import { MobileModalHeader } from "./components/mobile/MobileModalHeader";
import { MobileModalContent } from "./components/mobile/MobileModalContent";
import { MobileImageViewer } from "./components/mobile/MobileImageViewer";
import { MobileNavigationControls } from "./components/mobile/MobileNavigationControls";
import { useLocalWorkOrderState } from "@/hooks/useLocalWorkOrderState";
import { useQueryClient } from "@tanstack/react-query";

interface MobileImageViewModalProps {
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
  filters
}: MobileImageViewModalProps) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const {
    currentWorkOrder: navigationWorkOrder,
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
  
  if (!localWorkOrder) return null;

  // Get images from the work order's completion_response
  const completionData = localWorkOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
  // Status color for border
  const statusBorderColor = getStatusBorderColor(localWorkOrder.status || "pending_review");

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

  // Toggle image viewer mode
  const openImageViewer = () => setIsImageViewerOpen(true);
  const closeImageViewer = () => setIsImageViewerOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={handleLocalClose}>
      <DialogContent className={`max-w-full p-0 h-[90vh] w-[95vw] flex flex-col rounded-lg overflow-hidden border-t-4 ${statusBorderColor}`}>
        {isImageViewerOpen ? (
          // Show image viewer when in image mode
          <>
            <MobileImageViewer
              workOrderId={localWorkOrder.id}
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
              workOrder={localWorkOrder} 
              onClose={handleLocalClose}
              filters={filters}
              workOrders={workOrders}
              onAdvanceToNextOrder={handleAdvanceToNextOrder} 
            />
            
            <MobileModalContent
              workOrder={localWorkOrder}
              images={images}
              onViewImages={openImageViewer}
              onStatusUpdate={handleLocalStatusUpdate}
              onDownloadAll={onDownloadAll}
              onResolveFlag={handleLocalResolveFlag}
            />
            
            <MobileNavigationControls 
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
