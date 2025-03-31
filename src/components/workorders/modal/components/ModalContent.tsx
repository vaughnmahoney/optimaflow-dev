
import React from "react";
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
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-col h-full overflow-auto ${isMobile ? 'overflow-y-auto' : ''}`}>
      {/* Image viewer - takes full width on mobile */}
      <div className={`${isMobile ? 'min-h-[70vh]' : 'w-full md:w-2/3'} flex flex-col`}>
        <ImageContent 
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
        />
      </div>
      
      {/* Order details */}
      <div className={`${isMobile ? 'w-full' : 'w-full md:w-1/3 border-l'}`}>
        <OrderDetails workOrder={workOrder} />
      </div>
    </div>
  );
};
