
import React, { useState } from "react";
import { WorkOrder } from "../../types";
import { OrderDetails } from "./OrderDetails";
import { ImageContent } from "./ImageContent";
import { ImageType } from "../../types/image";
import { useIsMobile } from "@/hooks/use-mobile";

interface ModalContentProps {
  workOrder: WorkOrder;
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
}

export const ModalContent = ({
  workOrder,
  images,
  currentImageIndex,
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand,
}: ModalContentProps) => {
  const [showImagesGrid, setShowImagesGrid] = useState(false);
  const isMobile = useIsMobile();

  const toggleImagesGrid = () => {
    setShowImagesGrid(!showImagesGrid);
  };
  
  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-full overflow-hidden`}>
      {/* Image viewer */}
      <div className={`${isMobile ? 'w-full' : 'w-2/3'} flex flex-col`}>
        <ImageContent 
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
          isMobile={isMobile}
          showImagesGrid={showImagesGrid}
          toggleImagesGrid={toggleImagesGrid}
        />
      </div>
      
      {/* Order details */}
      <div className={`${isMobile ? 'w-full border-t' : 'w-1/3 border-l'} flex flex-col`}>
        <OrderDetails workOrder={workOrder} />
      </div>
    </div>
  );
};
