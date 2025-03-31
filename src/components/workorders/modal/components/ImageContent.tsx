
import React from "react";
import { ImageType } from "../../types/image";
import { ImageViewer } from "./ImageViewer";
import { ImageThumbnails } from "./ImageThumbnails";
import { ImageEmptyState } from "./ImageEmptyState";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  if (images.length === 0) {
    return <ImageEmptyState />;
  }

  return (
    <div className={`flex flex-1 ${isMobile ? 'h-full' : 'h-full overflow-hidden'}`}>
      {/* Hide thumbnails on mobile */}
      {!isMobile && (
        <ImageThumbnails
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
        />
      )}
      
      <div className={`relative flex-1 ${isMobile ? 'h-full' : isImageExpanded ? 'max-h-full' : 'max-h-[60vh]'}`}>
        <ImageViewer 
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
