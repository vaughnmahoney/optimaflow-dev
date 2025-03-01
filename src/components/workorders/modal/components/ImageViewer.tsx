
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn } from "lucide-react";

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoomModeEnabled, setZoomModeEnabled] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(images.length - 1);
    }
    // Reset zoom when changing images
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(0);
    }
    // Reset zoom when changing images
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleZoomMode = () => {
    // Toggle zoom mode on/off
    setZoomModeEnabled(!zoomModeEnabled);
    
    // If turning off zoom mode, reset zoom
    if (zoomModeEnabled) {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Handle image click for zooming at cursor position
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isImageExpanded) {
      toggleImageExpand();
      return;
    }
    
    // Only handle zoom if zoom mode is enabled
    if (!zoomModeEnabled) return;
    
    if (zoomLevel === 1) {
      const imageRect = imageRef.current?.getBoundingClientRect();
      if (!imageRect) return;
      
      // Calculate where the click occurred as a percentage of the image dimensions
      const clickX = (e.clientX - imageRect.left) / imageRect.width;
      const clickY = (e.clientY - imageRect.top) / imageRect.height;
      
      // Zoom in centered on the click position
      setZoomLevel(2);
      
      // Calculate position offset to center the clicked point
      // The multiplier affects how much the image moves - adjusted for better precision
      setPosition({
        x: (0.5 - clickX) * imageRect.width,
        y: (0.5 - clickY) * imageRect.height
      });
    } else {
      // Reset zoom when clicking while already zoomed
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
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
              className="max-h-full max-w-full object-contain cursor-pointer transition-all duration-200"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
                translate: `${position.x}px ${position.y}px`,
                cursor: zoomModeEnabled ? (zoomLevel === 1 ? 'zoom-in' : 'zoom-out') : 'pointer'
              }}
              onClick={handleImageClick}
            />
          </div>
          
          {/* Image counter */}
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
          
          {/* Previous/Next buttons */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md ml-2"
              onClick={handlePrevious}
              aria-label="Previous image"
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
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Control buttons */}
          <div className="absolute top-4 left-4 flex gap-2">
            {/* Expand/Collapse button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleImageExpand}
              className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md"
              aria-label={isImageExpanded ? "Minimize image" : "Maximize image"}
            >
              {isImageExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            
            {/* Zoom toggle button - only show when expanded */}
            {isImageExpanded && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleZoomMode}
                className={`h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md ${zoomModeEnabled ? 'bg-blue-100 border-blue-300' : ''}`}
                aria-label={zoomModeEnabled ? "Disable zoom mode" : "Enable zoom mode"}
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
          
          {/* Zoom mode indicator */}
          {isImageExpanded && zoomModeEnabled && zoomLevel === 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
              Click to zoom
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-muted-foreground p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="h-16 w-16 mx-auto mb-4 text-gray-400 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <span className="text-2xl">×</span>
          </div>
          <p className="text-lg font-medium">No images available</p>
          <p className="text-sm">This work order doesn't have any uploaded images.</p>
        </div>
      )}
    </div>
  );
};
