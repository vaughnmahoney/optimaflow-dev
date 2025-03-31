
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
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-full overflow-auto`}>
      {/* Left side: Image viewer */}
      <div className={`${isMobile ? 'w-full min-h-[70vh]' : 'w-full md:w-2/3'} flex flex-col`}>
        <ImageContent 
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
        />
      </div>
      
      {/* Right side: Order details */}
      <div className={`${isMobile ? 'w-full' : 'w-full md:w-1/3'} flex flex-col ${isMobile ? '' : 'border-l'}`}>
        <OrderDetails workOrder={workOrder} />
      </div>
    </div>
  );
};
