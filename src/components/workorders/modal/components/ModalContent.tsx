
import { useState } from "react";
import { WorkOrder } from "../../types";
import { ImageThumbnails } from "./ImageThumbnails";
import { ImageViewer } from "./ImageViewer";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";

interface ModalContentProps {
  workOrder: WorkOrder;
  images: Array<{ url: string; flagged?: boolean }>;
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
  const { toggleImageFlag } = useWorkOrderMutations();
  
  // Handle image flag toggle
  const handleToggleFlag = (imageIndex: number, flagged: boolean) => {
    toggleImageFlag(workOrder.id, imageIndex, flagged);
  };

  return (
    <div className="flex-1 overflow-hidden flex h-full">
      {!isImageExpanded && (
        <ImageThumbnails
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
        />
      )}
      
      <div className={`flex-1 h-full ${isImageExpanded ? 'w-full' : ''}`}>
        <ImageViewer
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
          onToggleFlag={handleToggleFlag}
          workOrderId={workOrder.id}
        />
      </div>
    </div>
  );
};
