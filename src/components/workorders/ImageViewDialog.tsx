import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderDetailsSidebar } from "./WorkOrderDetailsSidebar";
import { ImageViewer } from "./ImageViewer";
import { WorkOrderNavigation } from "./WorkOrderNavigation";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const queryClient = useQueryClient();
  const currentWorkOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);

  // Prefetch adjacent work orders
  useEffect(() => {
    if (!workOrderId) return;

    const prefetchWorkOrder = async (id: string) => {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ["workOrder", id],
          queryFn: async () => {
            const { data, error } = await supabase
              .from("work_orders")
              .select(`*, technicians (name)`)
              .eq("id", id)
              .single();
            if (error) throw error;
            return data;
          }
        }),
        queryClient.prefetchQuery({
          queryKey: ["workOrderImages", id],
          queryFn: async () => {
            const { data, error } = await supabase
              .from("work_order_images")
              .select("*")
              .eq("work_order_id", id);
            if (error) throw error;
            return data;
          }
        })
      ]);
    };

    // Prefetch next work order
    if (currentWorkOrderIndex < workOrders.length - 1) {
      prefetchWorkOrder(workOrders[currentWorkOrderIndex + 1].id);
    }
    // Prefetch previous work order
    if (currentWorkOrderIndex > 0) {
      prefetchWorkOrder(workOrders[currentWorkOrderIndex - 1].id);
    }
  }, [workOrderId, currentWorkOrderIndex, workOrders, queryClient]);

  const { data: workOrder, isLoading: isWorkOrderLoading } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          technicians (name)
        `)
        .eq("id", workOrderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!workOrderId,
  });

  const { data: images, isLoading: isImagesLoading } = useQuery({
    queryKey: ["workOrderImages", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      
      const { data, error } = await supabase
        .from("work_order_images")
        .select("*")
        .eq("work_order_id", workOrderId);

      if (error) throw error;
      return data;
    },
    enabled: !!workOrderId,
  });

  // Handle status updates and cache invalidation
  const handleStatusUpdate = async (status: string) => {
    if (!workOrderId) return;
    
    // Call the parent's onStatusUpdate
    await onStatusUpdate(workOrderId, status);
    
    // Immediately update the cache with the new status
    queryClient.setQueryData(["workOrder", workOrderId], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        qc_status: status
      };
    });
  };

  const handlePreviousWorkOrder = () => {
    if (currentWorkOrderIndex > 0) {
      const previousWorkOrder = workOrders[currentWorkOrderIndex - 1];
      setCurrentImageIndex(0);
      setIsTransitioning(true);
      
      // Direct navigation instead of closing/reopening dialog
      const event = new CustomEvent('openWorkOrder', { detail: previousWorkOrder.id });
      window.dispatchEvent(event);
      
      // Reset transition state after a short delay
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleNextWorkOrder = () => {
    if (currentWorkOrderIndex < workOrders.length - 1) {
      const nextWorkOrder = workOrders[currentWorkOrderIndex + 1];
      setCurrentImageIndex(0);
      setIsTransitioning(true);
      
      // Direct navigation instead of closing/reopening dialog
      const event = new CustomEvent('openWorkOrder', { detail: nextWorkOrder.id });
      window.dispatchEvent(event);
      
      // Reset transition state after a short delay
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isTransitioning) return; // Prevent navigation during transitions
      
      switch (e.key) {
        case "ArrowLeft":
          if (currentImageIndex === 0) {
            handlePreviousWorkOrder();
          } else {
            setCurrentImageIndex((prev) => prev - 1);
          }
          break;
        case "ArrowRight":
          if (currentImageIndex === (images?.length ?? 1) - 1) {
            handleNextWorkOrder();
          } else {
            setCurrentImageIndex((prev) => prev + 1);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentImageIndex, images?.length, isTransitioning]);

  const handlePrevious = () => {
    if (isTransitioning) return;
    
    if (currentImageIndex === 0) {
      handlePreviousWorkOrder();
    } else {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (isTransitioning) return;
    
    if (currentImageIndex === (images?.length ?? 1) - 1) {
      handleNextWorkOrder();
    } else {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const handleDownloadAll = async () => {
    console.log("Downloading all images");
  };

  const isLoading = isWorkOrderLoading || isImagesLoading || isTransitioning;

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
                isLoading={isLoading}
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
