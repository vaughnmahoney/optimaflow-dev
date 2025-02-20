
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkOrder } from "./types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";

interface ImageViewModalProps {
  workOrder: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
}

export const ImageViewModal = ({ 
  workOrder, 
  isOpen, 
  onClose,
  onStatusUpdate 
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

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Work Order #{workOrder?.order_no}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {images.length > 0 ? (
          <div className="relative flex-1 flex items-center justify-center">
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
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No images available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
