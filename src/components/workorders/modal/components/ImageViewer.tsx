
import { useState, useRef, useEffect } from "react";
import { useImageZoom } from "@/hooks/useImageZoom";
import { ImageType } from "../../types/image";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn, Grid2X2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
  isMobile?: boolean;
  toggleImagesGrid?: () => void;
  totalImages: number;
}

export const ImageViewer = ({
  images,
  currentImageIndex,
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand,
  isMobile = false,
  toggleImagesGrid = () => {},
  totalImages
}: ImageViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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
      setIsLoading(true);
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (images.length > 0) {
      setIsLoading(true);
      setCurrentImageIndex(images.length - 1);
    }
    // Reset zoom when changing images
    resetZoomOnImageChange();
  };
  
  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setIsLoading(true);
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (images.length > 0) {
      setIsLoading(true);
      setCurrentImageIndex(0);
    }
    // Reset zoom when changing images
    resetZoomOnImageChange();
  };

  // Handle image load complete
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-800">
        <div className="text-center space-y-4 text-muted-foreground">
          <div className="mx-auto h-16 w-16 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium">No images available</p>
          <p className="text-sm">This work order doesn't have any images attached.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-hidden h-full w-full"
    >
      <div 
        className="max-h-full max-w-full overflow-hidden flex items-center justify-center"
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
      
      {/* Image counter */}
      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentImageIndex + 1} / {totalImages}
      </div>
      
      {/* Previous/Next buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md ml-2"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md mr-2"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Control buttons */}
      <div className="absolute top-4 left-4 flex gap-2">
        {/* Grid view button (mobile only) */}
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleImagesGrid}
            className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md"
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={toggleImageExpand}
          className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md"
        >
          {isImageExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
        
        {isImageExpanded && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleZoomMode}
            className={`h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md ${zoomModeEnabled ? 'bg-blue-100 border-blue-300' : ''}`}
          >
            <ZoomIn className={`h-4 w-4 ${zoomModeEnabled ? 'text-blue-500' : ''}`} />
          </Button>
        )}
      </div>
      
      {/* Zoom indicator - only show when zoomed */}
      {isImageExpanded && zoomLevel !== 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
          {Math.round(zoomLevel * 100)}%
        </div>
      )}
    </div>
  );
};
