
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";

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
  
  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(images.length - 1);
    }
    // Reset zoom when changing images
    setZoomLevel(1);
  };
  
  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(0);
    }
    // Reset zoom when changing images
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div className="relative flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-hidden h-full w-full">
      {images.length > 0 ? (
        <>
          <img 
            src={images[currentImageIndex]?.url} 
            alt={`Service image ${currentImageIndex + 1}`}
            className="max-h-full max-w-full object-contain cursor-pointer transition-transform"
            style={{ transform: `scale(${zoomLevel})` }}
            onClick={toggleImageExpand}
          />
          
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
            
            {/* Zoom controls - only show when expanded */}
            {isImageExpanded && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomIn}
                  className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md"
                  aria-label="Zoom in"
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomOut}
                  className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md"
                  aria-label="Zoom out"
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          {/* Zoom indicator - only show when zoomed */}
          {isImageExpanded && zoomLevel !== 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
              {Math.round(zoomLevel * 100)}%
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
