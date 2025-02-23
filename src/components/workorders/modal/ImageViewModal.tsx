
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { WorkOrder } from "../types";
import { ImageViewer } from "./modal/ImageViewer";
import { NavigationFooter } from "./NavigationFooter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModalHeader } from "./components/ModalHeader";
import { ActionButtons } from "./components/ActionButtons";
import { TabsContainer } from "./components/TabsContainer";

interface ImageViewModalProps {
  workOrder: WorkOrder | null;
  workOrders: WorkOrder[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onNavigate: (index: number) => void;
  onDownloadAll?: () => void;
}

export const ImageViewModal = ({
  workOrder,
  workOrders,
  currentIndex,
  isOpen,
  onClose,
  onStatusUpdate,
  onNavigate,
  onDownloadAll,
}: ImageViewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const completionData = workOrder?.completion_response?.orders[0]?.data;
  const images = completionData?.form?.images || [];
  
  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(images.length - 1);
    }
  };
  
  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(0);
    }
  };

  const handlePreviousOrder = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
      setCurrentImageIndex(0);
    }
  };

  const handleNextOrder = () => {
    if (currentIndex < workOrders.length - 1) {
      onNavigate(currentIndex + 1);
      setCurrentImageIndex(0);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!workOrder || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onStatusUpdate?.(workOrder.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (e.altKey) {
            handlePreviousOrder();
          } else {
            handlePrevious();
          }
          break;
        case 'ArrowRight':
          if (e.altKey) {
            handleNextOrder();
          } else {
            handleNext();
          }
          break;
        case 'Escape':
          onClose();
          break;
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleStatusUpdate('approved');
          }
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleStatusUpdate('flagged');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, currentImageIndex, workOrders.length, images.length, isUpdating]);

  if (!workOrder) return null;

  const driverInfo = workOrder.completion_response?.orders[0]?.data?.form || {};
  const driverName = String(driverInfo.driver_name || 'No Driver Assigned');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-xl max-h-[90vh] p-0 flex flex-col rounded-lg border shadow-lg animate-fade-in">
        <ModalHeader
          orderNo={workOrder.order_no}
          status={workOrder.status}
          driverName={driverName}
          onClose={onClose}
        />
        
        <div className="flex-1 grid grid-cols-[2fr_3fr] min-h-0 divide-x">
          {/* Left Panel - Details */}
          <div className="bg-background flex flex-col min-h-0">
            <TabsContainer workOrder={workOrder} />
            <ActionButtons
              workOrderId={workOrder.id}
              hasImages={workOrder.completion_response?.orders[0]?.data?.form?.images?.length > 0}
              currentStatus={workOrder.status}
              onStatusUpdate={onStatusUpdate}
              onDownloadAll={onDownloadAll}
            />
          </div>

          {/* Right Panel - Image Viewer */}
          <div className="bg-background/50 flex flex-col min-h-0">
            <div className="flex-1 relative">
              <ImageViewer
                images={workOrder.completion_response?.orders[0]?.data?.form?.images || []}
                currentImageIndex={currentImageIndex}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <TooltipProvider>
          <NavigationFooter
            currentIndex={currentIndex}
            totalItems={workOrders.length}
            onNavigate={onNavigate}
          />
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};
