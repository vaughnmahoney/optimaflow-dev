
import { useState, useRef } from "react";
import { useImageZoom } from "@/hooks/useImageZoom";
import { ImageControls } from "./ImageControls";
import { ImageEmptyState } from "./ImageEmptyState";

interface ImageViewerProps {
  images: Array<{ url: string }>;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
}

export const ImageViewer = ({
  images,
  currentImageIndex,
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand,
}: ImageViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    zoomLevel,
    position,
    zoomModeEnabled,
    isDragging,
    imageRef,
    toggleZoomMode,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleImageClick,
    resetZoomOnImageChange
  } = useImageZoom({ isImageExpanded });
  
  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(images.length - 1);
    }
    // Reset zoom when changing images
    resetZoomOnImageChange();
  };
  
  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(0);
    }
    // Reset zoom when changing images
    resetZoomOnImageChange();
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-hidden h-full w-full"
    >
      {images.length > 0 ? (
        <>
          <div 
            className="max-h-full max-w-full overflow-hidden flex items-center justify-center"
            style={{ 
              width: "100%", 
              height: "100%",
            }}
          >
            <img 
              ref={imageRef}
              src={images[currentImageIndex]?.url} 
              alt={`Service image ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain transition-all duration-200"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
                translate: `${position.x}px ${position.y}px`,
                cursor: zoomModeEnabled 
                  ? (zoomLevel === 1 
                    ? 'zoom-in' 
                    : isDragging 
                      ? 'grabbing' 
                      : 'grab')
                  : 'pointer'
              }}
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              draggable="false"
            />
          </div>
          
          <ImageControls 
            imagesCount={images.length}
            currentImageIndex={currentImageIndex}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            isImageExpanded={isImageExpanded}
            toggleImageExpand={toggleImageExpand}
            zoomModeEnabled={zoomModeEnabled}
            toggleZoomMode={toggleZoomMode}
            zoomLevel={zoomLevel}
          />
        </>
      ) : (
        <ImageEmptyState />
      )}
    </div>
  );
};
