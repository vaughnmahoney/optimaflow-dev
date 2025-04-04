import { useState } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { WorkOrder } from "../types";
import { useWorkOrderNavigation } from "@/hooks/useWorkOrderNavigation";
import { Loader2 } from "lucide-react";
import { isMobile } from "@/hooks/use-mobile";
import { MobileImageViewModal } from "./MobileImageViewModal";
import { ModalHeader } from "./components/ModalHeader";
import { ModalContent } from "./components/ModalContent";
import { ModalFooter } from "./components/ModalFooter";
import { NavigationControls } from "./components/NavigationControls";

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
        onPageBoundary={onPageBoundary}
        onDownloadAll={onDownloadAll}
        onResolveFlag={onResolveFlag}
        filters={filters}
      />
    );
  }
  
  if (isNavigatingPages && !currentWorkOrder) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay />
        <DialogContent className="max-w-6xl p-0 h-[90vh] flex flex-col rounded-lg overflow-hidden border-t-4 bg-white shadow-xl w-[95%] m-0">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
              </div>
              <p className="text-lg font-medium text-gray-600">Loading work orders...</p>
            </div>
          </div>
          <NavigationControls
            currentIndex={navIndex >= 0 ? navIndex : 0}
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
  }
  
  if (!currentWorkOrder) return null;

  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };

  const completionData = currentWorkOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  
  const statusBorderColor = getStatusBorderColor(currentWorkOrder.status || "pending_review");
  
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

  const handleNavigate = (index: number) => {
    handleSetOrder(index);
    onNavigate(index);
  };
  
  const handleAdvanceToNextOrder = (nextOrderId: string) => {
    const nextIndex = workOrders.findIndex(wo => wo.id === nextOrderId);
    if (nextIndex !== -1) {
      handleNavigate(nextIndex);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent className="max-w-6xl p-0 h-[90vh] flex flex-col rounded-lg overflow-hidden border-t-4 bg-white shadow-xl w-[95%] m-0" style={{ borderTopColor: getBorderColor() }}>
        <ModalHeader 
          workOrder={currentWorkOrder} 
          onClose={onClose} 
          filters={filters}
          workOrders={workOrders}
          onAdvanceToNextOrder={handleAdvanceToNextOrder}
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
          isNavigatingPages={isNavigatingPages}
          hasPreviousPage={onPageBoundary !== undefined && navIndex === 0}
          hasNextPage={onPageBoundary !== undefined && navIndex === workOrders.length - 1}
        />
      </DialogContent>
    </Dialog>
  );
};
