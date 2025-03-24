
import React from "react";
import { useImageViewer } from "@/hooks/useImageViewer";
import { ImageControls } from "./ImageControls";
import { ImageThumbnails } from "./ImageThumbnails";
import { ImageEmptyState } from "./ImageEmptyState";
import { ImageViewer } from "./ImageViewer";

interface ImageContentProps {
  images: string[];
  initialImageIndex?: number;
}

export function ImageContent({ images, initialImageIndex = 0 }: ImageContentProps) {
  const {
    currentImageIndex,
    setCurrentImageIndex,
    currentImage,
    totalImages,
    nextImage,
    previousImage,
    isImageExpanded,
    toggleImageExpand
  } = useImageViewer({ 
    images, 
    initialIndex: initialImageIndex 
  });

  if (images.length === 0) {
    return <ImageEmptyState />;
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className={`relative flex-1 ${isImageExpanded ? 'max-h-full' : 'max-h-[60vh]'}`}>
        <ImageViewer 
          currentImage={currentImage}
          isExpanded={isImageExpanded}
          onNext={nextImage}
          onPrevious={previousImage}
        />
        
        <ImageControls
          currentIndex={currentImageIndex}
          totalImages={totalImages}
          isExpanded={isImageExpanded}
          onToggleExpand={toggleImageExpand}
          onNext={nextImage}
          onPrevious={previousImage}
        />
      </div>
      
      <ImageThumbnails
        images={images}
        currentIndex={currentImageIndex}
        onSelect={setCurrentImageIndex}
      />
    </div>
  );
}
