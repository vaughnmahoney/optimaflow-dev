import React from "react";
import { WorkOrder } from "../../types";
import { OrderDetails } from "./OrderDetails";
import { ImageContent } from "./ImageContent";
import { ImageType } from "../../types/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

interface ModalContentProps {
  workOrder: WorkOrder;
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
  openMobileImageViewer?: () => void;
}

export const ModalContent = ({
  workOrder,
  images,
  currentImageIndex,
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand,
  openMobileImageViewer
}: ModalContentProps) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Order details take full width on mobile */}
        <div className="w-full flex-1 flex flex-col overflow-auto">
          <OrderDetails workOrder={workOrder} />

          {/* Add image viewer button if there are images */}
          {images.length > 0 && (
            <div className="p-4 border-t">
              <Button 
                onClick={openMobileImageViewer}
                className="w-full flex items-center justify-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                View {images.length} {images.length === 1 ? 'Image' : 'Images'}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Desktop layout remains unchanged
  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left side: Image viewer */}
      <div className="w-full md:w-2/3 flex flex-col">
        <ImageContent 
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
        />
      </div>
      
      {/* Right side: Order details */}
      <div className="w-full md:w-1/3 flex flex-col border-l">
        <OrderDetails workOrder={workOrder} />
      </div>
    </div>
  );
};
