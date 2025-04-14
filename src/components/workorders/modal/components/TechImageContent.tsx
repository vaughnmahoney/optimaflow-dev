
import React from "react";
import { ImageType } from "../../types/image";
import { TechImageViewer } from "./TechImageViewer";
import { ImageThumbnails } from "./ImageThumbnails";
import { ImageEmptyState } from "./ImageEmptyState";

interface TechImageContentProps {
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
}

export function TechImageContent({ 
  images, 
  currentImageIndex, 
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand 
}: TechImageContentProps) {
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
      
      <div className="relative flex-1 h-full">
        <TechImageViewer 
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
