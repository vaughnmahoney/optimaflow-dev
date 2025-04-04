
import React from "react";
import { WorkOrder } from "../../types";
import { ImageContent } from "./ImageContent";
import { ImageType } from "../../types/image";
import { MobileOrderDetails } from "./mobile/MobileOrderDetails";

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
  return (
    <div className="flex flex-col md:flex-row flex-1 h-full overflow-hidden">
      {/* Left side: Image viewer */}
      <div className="flex-1 md:w-2/3 flex flex-col h-full">
        <ImageContent 
          workOrderId={workOrder.id}
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
        />
      </div>
      
      {/* Right side: Order details panel with continuous scrolling */}
      <div className="w-full md:w-1/3 flex flex-col border-l h-full overflow-hidden">
        <MobileOrderDetails workOrder={workOrder} />
      </div>
    </div>
  );
}
