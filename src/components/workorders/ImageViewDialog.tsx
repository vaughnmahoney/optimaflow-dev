
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WorkOrderDetailsSidebar } from "./WorkOrderDetailsSidebar";
import { ImageViewer } from "./ImageViewer";
import { WorkOrderNavigation } from "./WorkOrderNavigation";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useImageNavigation } from "@/hooks/useImageNavigation";
import { useWorkOrderPrefetch } from "@/hooks/useWorkOrderPrefetch";

interface ImageViewDialogProps {
  workOrderId: string | null;
  onClose: () => void;
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  workOrders: { id: string }[];
}

export const ImageViewDialog = ({ 
  workOrderId, 
  onClose, 
  onStatusUpdate, 
  workOrders 
}: ImageViewDialogProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const queryClient = useQueryClient();
  const currentWorkOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);

  // Use our custom hooks
  const { workOrder, images, isLoading } = useWorkOrderData(workOrderId);
  useWorkOrderPrefetch(workOrderId, currentWorkOrderIndex, workOrders);

  const handlePreviousWorkOrder = () => {
    if (currentWorkOrderIndex > 0) {
      const previousWorkOrder = workOrders[currentWorkOrderIndex - 1];
      setIsTransitioning(true);
      
      const event = new CustomEvent('openWorkOrder', { detail: previousWorkOrder.id });
      window.dispatchEvent(event);
      
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleNextWorkOrder = () => {
    if (currentWorkOrderIndex < workOrders.length - 1) {
      const nextWorkOrder = workOrders[currentWorkOrderIndex + 1];
      setIsTransitioning(true);
      
      const event = new CustomEvent('openWorkOrder', { detail: nextWorkOrder.id });
      window.dispatchEvent(event);
      
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const { 
    currentImageIndex, 
    setCurrentImageIndex, 
    handlePrevious, 
    handleNext 
  } = useImageNavigation({
    totalImages: images?.length || 0,
    onPreviousWorkOrder: handlePreviousWorkOrder,
    onNextWorkOrder: handleNextWorkOrder,
    isTransitioning
  });

  // Handle status updates and cache invalidation
  const handleStatusUpdate = async (status: string) => {
    if (!workOrderId) return;
    
    await onStatusUpdate(workOrderId, status);
    
    queryClient.setQueryData(["workOrder", workOrderId], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        qc_status: status
      };
    });
  };

  const handleDownloadAll = async () => {
    console.log("Downloading all images");
  };

  return (
    <Dialog 
      open={!!workOrderId} 
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-6xl p-0">
        <div className="flex flex-col h-full">
          <div className="flex flex-1 min-h-0">
            <WorkOrderDetailsSidebar
              workOrder={workOrder}
              onClose={onClose}
              onStatusUpdate={handleStatusUpdate}
              onDownloadAll={handleDownloadAll}
            />

            <div className="flex-1 p-6">
              <ImageViewer
                images={images || []}
                currentImageIndex={currentImageIndex}
                isLoading={isLoading || isTransitioning}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onImageSelect={setCurrentImageIndex}
              />
            </div>
          </div>

          <WorkOrderNavigation
            currentIndex={currentWorkOrderIndex}
            totalCount={workOrders.length}
            onPrevious={handlePreviousWorkOrder}
            onNext={handleNextWorkOrder}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
