
import { useRef, useEffect } from "react";
import { useImageZoom } from "@/hooks/useImageZoom";
import { ImageType } from "../../types/image";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { useImagePreloading } from "@/hooks/useImagePreloading";
import { ImageNavigationButtons } from "./ImageNavigationButtons";
import { ImageControlButtons } from "./ImageControlButtons";
import { ImageStatusIndicators } from "./ImageStatusIndicators";
import { ImageEmptyState } from "./ImageEmptyState";
import { useImageCaching } from "@/hooks/useImageCaching";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
  const { isProcessing, cacheWorkOrderImages, isImageCached } = useImageCaching();
  
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
  
  // Check if the current image is cached
  const currentImageIsCached = currentImageIndex >= 0 && 
                               images.length > currentImageIndex && 
                               isImageCached(images[currentImageIndex]?.url || '');
  
  useEffect(() => {
    // If there are images but the current one doesn't appear to be cached, show a message
    if (images.length > 0 && !currentImageIsCached && !isLoading) {
      // Only show this message if the image URL doesn't appear to be from our storage
      // This avoids showing the message for already cached images
      const currentImageUrl = images[currentImageIndex]?.url || '';
      if (!currentImageUrl.includes('supabase.co')) {
        toast.info(
          <div className="flex flex-col gap-2">
            <p>This image is from OptimoRoute and may not be available after a week.</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleCacheImages()}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4 mr-2" />
              {isProcessing ? 'Caching...' : 'Cache all images'}
            </Button>
          </div>,
          { duration: 6000 }
        );
      }
    }
  }, [currentImageIndex, images, currentImageIsCached]);
  
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

  // Handle caching images
  const handleCacheImages = async () => {
    if (!workOrderId) return;
    
    const success = await cacheWorkOrderImages(workOrderId);
    if (success) {
      toast.success('Images cached successfully. Refresh the page to see cached images.');
    }
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
        
        {/* Cache notice for non-cached images */}
        {!currentImageIsCached && !isLoading && (
          <div className="absolute top-4 right-4 z-10">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={handleCacheImages}
              disabled={isProcessing}
              className="bg-white/90 hover:bg-white text-gray-900 border shadow-md"
            >
              <Download className="h-4 w-4 mr-1" />
              {isProcessing ? 'Caching...' : 'Cache for long-term storage'}
            </Button>
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
