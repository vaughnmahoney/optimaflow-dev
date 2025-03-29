import React from "react";
import { useImageViewer } from "@/hooks/useImageViewer";
import { ImageControls } from "./ImageControls";
import { ImageThumbnails } from "./ImageThumbnails";
import { ImageEmptyState } from "./ImageEmptyState";
import { ImageViewer } from "./ImageViewer";
import { ImageType } from "../../types/image";

interface ImageContentProps {
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
}

export function ImageContent({ 
  images, 
  currentImageIndex, 
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand 
}: ImageContentProps) {
  const {
    nextImage,
    previousImage,
  } = useImageViewer({ 
    images, 
    initialIndex: currentImageIndex 
  });

  if (images.length === 0) {
    return <ImageEmptyState />;
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className={`relative flex-1 ${isImageExpanded ? 'max-h-full' : 'max-h-[60vh]'}`}>
        <ImageViewer 
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
        />
        
        <ImageControls
          imagesCount={images.length}
          currentImageIndex={currentImageIndex}
          handlePrevious={previousImage}
          handleNext={nextImage}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
          zoomModeEnabled={false}
          toggleZoomMode={() => {}}
          zoomLevel={1}
        />
      </div>
      
      <ImageThumbnails
        images={images}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
      />
    </div>
  );
}
