
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkOrder } from "./types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { WorkOrderDetailsSidebar } from "./WorkOrderDetailsSidebar";
import { WorkOrderNavigation } from "./WorkOrderNavigation";

interface ImageViewModalProps {
  workOrder: WorkOrder | null;
  workOrders: WorkOrder[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onNavigate: (index: number) => void;
}

export const ImageViewModal = ({ 
  workOrder, 
  workOrders,
  currentIndex,
  isOpen, 
  onClose,
  onStatusUpdate,
  onNavigate
}: ImageViewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = workOrder?.completion_response?.photos || [];
  
  const handlePrevious = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };
  
  const handleNext = () => {
    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePreviousOrder = () => {
    onNavigate(currentIndex - 1);
  };

  const handleNextOrder = () => {
    onNavigate(currentIndex + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0">
        <div className="flex h-full">
          {/* Left Side - Work Order Details */}
          <div className="w-1/3 border-r">
            {workOrder && (
              <WorkOrderDetailsSidebar
                workOrder={workOrder}
                onStatusUpdate={onStatusUpdate}
              />
            )}
          </div>

          {/* Right Side - Image Viewer */}
          <div className="w-2/3 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                Work Order #{workOrder?.order_no}
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4">
              {images.length > 0 ? (
                <>
                  <img 
                    src={images[currentImageIndex]?.url} 
                    alt={`Image ${currentImageIndex + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2"
                        onClick={handlePrevious}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2"
                        onClick={handleNext}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  No images available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <WorkOrderNavigation
          currentIndex={currentIndex}
          totalCount={workOrders.length}
          onPrevious={handlePreviousOrder}
          onNext={handleNextOrder}
        />
      </DialogContent>
    </Dialog>
  );
};
