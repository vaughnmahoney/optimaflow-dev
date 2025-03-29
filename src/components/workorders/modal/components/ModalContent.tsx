
import React from "react";
import { WorkOrder } from "../../types";
import { OrderDetails } from "./OrderDetails";
import { ImageContent } from "./ImageContent";
import { ImageType } from "../../types/image";

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
    <div className="flex flex-col md:flex-row h-full p-4 gap-4 overflow-auto">
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
      <div className="w-full md:w-1/3 flex flex-col">
        <OrderDetails workOrder={workOrder} />
      </div>
    </div>
  );
};
