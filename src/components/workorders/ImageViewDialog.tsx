
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const currentWorkOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);

  const { data: workOrder } = useQuery({
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

  const { data: images, isLoading } = useQuery({
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

  const handlePreviousWorkOrder = () => {
    if (currentWorkOrderIndex > 0) {
      const previousWorkOrder = workOrders[currentWorkOrderIndex - 1];
      setCurrentImageIndex(0);
      if (previousWorkOrder) {
        onClose();
        setTimeout(() => {
          const event = new CustomEvent('openWorkOrder', { detail: previousWorkOrder.id });
          window.dispatchEvent(event);
        }, 100);
      }
    }
  };

  const handleNextWorkOrder = () => {
    if (currentWorkOrderIndex < workOrders.length - 1) {
      const nextWorkOrder = workOrders[currentWorkOrderIndex + 1];
      setCurrentImageIndex(0);
      if (nextWorkOrder) {
        onClose();
        setTimeout(() => {
          const event = new CustomEvent('openWorkOrder', { detail: nextWorkOrder.id });
          window.dispatchEvent(event);
        }, 100);
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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
  }, [currentImageIndex, images?.length]);

  const handlePrevious = () => {
    if (currentImageIndex === 0) {
      handlePreviousWorkOrder();
    } else {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentImageIndex === (images?.length ?? 1) - 1) {
      handleNextWorkOrder();
    } else {
      setCurrentImageIndex((prev) => prev + 1);
    }
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
              onStatusUpdate={(status) => workOrderId && onStatusUpdate(workOrderId, status)}
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
