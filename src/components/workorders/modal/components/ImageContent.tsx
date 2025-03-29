
import React, { useState } from "react";
import { ImageType } from "../../types/image";
import { ImageViewer } from "./ImageViewer";
import { ImageThumbnails } from "./ImageThumbnails";
import { ImageEmptyState } from "./ImageEmptyState";
import { useViewportSize } from "@/hooks/useViewportSize";
import { ViewAllButton } from "./ViewAllButton";
import { ThumbnailDrawer } from "./ThumbnailDrawer";
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
  const [isThumbnailDrawerOpen, setIsThumbnailDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  
  if (images.length === 0) {
    return <ImageEmptyState />;
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Desktop Thumbnails - hidden on mobile */}
      <div className="hidden md:block">
        <ImageThumbnails
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
        />
      </div>
      
      <div className={`relative flex-1 ${isImageExpanded ? 'max-h-full' : 'max-h-[60vh]'}`}>
        {/* Main Image Viewer */}
        <ImageViewer 
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
        />
        
        {/* Mobile "View All" button - only shown on mobile */}
        {isMobile && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <ViewAllButton 
              onClick={() => setIsThumbnailDrawerOpen(true)} 
              totalImages={images.length}
            />
          </div>
        )}
      </div>
      
      {/* Mobile Thumbnail Drawer */}
      <ThumbnailDrawer
        isOpen={isThumbnailDrawerOpen}
        onClose={() => setIsThumbnailDrawerOpen(false)}
        images={images}
        currentImageIndex={currentImageIndex}
        onSelectImage={setCurrentImageIndex}
      />
    </div>
  );
}
