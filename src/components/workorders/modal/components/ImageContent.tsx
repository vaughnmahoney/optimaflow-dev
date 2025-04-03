
import React from "react";
import { ImageType } from "../../types/image";
import { ImageViewer } from "./ImageViewer";
import { ImageThumbnails } from "./ImageThumbnails";
import { ImageEmptyState } from "./ImageEmptyState";

interface ImageContentProps {
  workOrderId: string; // Added workOrderId prop
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
}

export function ImageContent({ 
  workOrderId, // Added workOrderId prop
  images, 
  currentImageIndex, 
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand 
}: ImageContentProps) {
  if (images.length === 0) {
    return <ImageEmptyState />;
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <ImageThumbnails
        images={images}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
      />
      
      <div className={`relative flex-1 ${isImageExpanded ? 'max-h-full' : 'max-h-[60vh]'}`}>
        <ImageViewer 
          workOrderId={workOrderId} // Pass the workOrderId prop
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
        />
      </div>
    </div>
  );
}
