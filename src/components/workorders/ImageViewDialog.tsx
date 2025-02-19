
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
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
  
  // Always call hooks at the top level, before any conditional logic
  const { workOrder, images, isLoading } = useWorkOrderData(workOrderId);
  const { 
    currentImageIndex, 
    setCurrentImageIndex, 
    handlePrevious, 
    handleNext 
  } = useImageNavigation({
    totalImages: images?.length || 0,
    onPreviousWorkOrder: () => handleWorkOrderChange(currentWorkOrderIndex - 1),
    onNextWorkOrder: () => handleWorkOrderChange(currentWorkOrderIndex + 1),
    isTransitioning
  });

  // Always call prefetch hook
  useWorkOrderPrefetch(workOrderId, currentWorkOrderIndex, workOrders);

  // Handle work order navigation
  const handleWorkOrderChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < workOrders.length) {
      setIsTransitioning(true);
      const nextWorkOrder = workOrders[newIndex];
      const event = new CustomEvent('openWorkOrder', { detail: nextWorkOrder.id });
      window.dispatchEvent(event);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

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

  // Early return with null if no workOrderId, but after all hooks
  if (!workOrderId) {
    return null;
  }

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
            onPrevious={() => handleWorkOrderChange(currentWorkOrderIndex - 1)}
            onNext={() => handleWorkOrderChange(currentWorkOrderIndex + 1)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
