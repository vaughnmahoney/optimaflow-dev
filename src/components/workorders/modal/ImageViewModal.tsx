
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { WorkOrder } from "../types";
import { NavigationFooter } from "./NavigationFooter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}: ImageViewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!workOrder) return null;

  const completionData = workOrder?.completion_response?.orders?.[0]?.data;
  const images = completionData?.form?.images || [];
  const driverName = workOrder.search_response?.scheduleInformation?.driverName || 'No Driver Assigned';
  
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Order #{workOrder.order_no}</h2>
            <p className="text-sm text-muted-foreground">Driver: {driverName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Image Viewer */}
        <div className="flex-1 flex items-center justify-center bg-background/50 relative overflow-hidden">
          {images.length > 0 ? (
            <>
              <img 
                src={images[currentImageIndex]?.url} 
                alt={`Service image ${currentImageIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
              
              {/* Image navigation */}
              <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
              
              {/* Previous/Next buttons */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          ) : (
            <div className="text-center text-muted-foreground p-4">
              No images available for this work order
            </div>
          )}
        </div>
        
        {/* Footer */}
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
