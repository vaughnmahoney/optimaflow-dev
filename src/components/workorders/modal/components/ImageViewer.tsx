
import { useRef } from "react";
import { useImageZoom } from "@/hooks/useImageZoom";
import { ImageType } from "../../types/image";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { useImagePreloading } from "@/hooks/useImagePreloading";
import { ImageNavigationButtons } from "./ImageNavigationButtons";
import { ImageControlButtons } from "./ImageControlButtons";
import { ImageStatusIndicators } from "./ImageStatusIndicators";
import { ImageEmptyState } from "./ImageEmptyState";

interface ImageViewerProps {
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
  workOrderId: string;
}

export const ImageViewer = ({
  images,
  currentImageIndex,
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand,
  workOrderId,
}: ImageViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleImageFlag } = useWorkOrderMutations();
  
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
  
  const { isLoading, handleImageLoad } = useImagePreloading(images, currentImageIndex);
  
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

  // Handle flag toggle
  const handleFlagToggle = () => {
    if (images.length <= 0 || currentImageIndex < 0) return;
    
    const currentImage = images[currentImageIndex];
    const isFlagged = !currentImage.flagged;
    
    toggleImageFlag(workOrderId, currentImageIndex, isFlagged);
  };

  if (images.length === 0) {
    return <ImageEmptyState />;
  }

  const currentImageFlagged = images[currentImageIndex]?.flagged || false;

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-hidden h-full w-full"
    >
      <div 
        className="h-full w-full flex items-center justify-center"
        style={{ 
          width: "100%", 
          height: "100%",
        }}
      >
        {/* Show skeleton while loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="h-16 w-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
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
          onLoad={handleImageLoad}
          draggable="false"
        />
      </div>
      
      {/* Status indicators */}
      <ImageStatusIndicators 
        currentIndex={currentImageIndex} 
        totalImages={images.length}
        zoomLevel={zoomLevel}
        isImageExpanded={isImageExpanded}
      />
      
      {/* Navigation buttons */}
      <ImageNavigationButtons 
        handlePrevious={handlePrevious}
        handleNext={handleNext}
      />
      
      {/* Control buttons */}
      <ImageControlButtons
        currentImageFlagged={currentImageFlagged}
        handleFlagToggle={handleFlagToggle}
        isImageExpanded={isImageExpanded}
        zoomModeEnabled={zoomModeEnabled}
        toggleZoomMode={toggleZoomMode}
      />
    </div>
  );
};
