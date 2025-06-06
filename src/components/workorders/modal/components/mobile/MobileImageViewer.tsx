
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { ImageType } from "../../../types/image";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { useImagePreloading } from "@/hooks/useImagePreloading";
import { useTouchGestures } from "@/hooks/useTouchGestures";
import { MobileImageHeader } from "./MobileImageHeader";
import { MobileThumbnails } from "./MobileThumbnails";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

interface MobileImageViewerProps {
  workOrderId: string;
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  onClose: () => void;
  onDownloadAll?: () => void;
}

export const MobileImageViewer = ({
  workOrderId,
  images,
  currentImageIndex,
  setCurrentImageIndex,
  onClose,
  onDownloadAll,
}: MobileImageViewerProps) => {
  const { toggleImageFlag } = useWorkOrderMutations();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle image navigation
  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(images.length - 1);
    }
  };
  
  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(0);
    }
  };

  // Use our custom hooks
  const { isLoading, loadedImages, handleImageLoad } = useImagePreloading(images, currentImageIndex);
  
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious
  });

  const handleFlagToggle = () => {
    if (images.length <= 0 || currentImageIndex < 0) return;
    
    const currentImage = images[currentImageIndex];
    const isFlagged = !currentImage.flagged;
    
    toggleImageFlag(workOrderId, currentImageIndex, isFlagged);
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <MobileImageHeader
          isFlagged={false}
          onFlagToggle={() => {}}
          onClose={onClose}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-500 font-medium">No images available</p>
            <p className="text-sm text-gray-400 mt-1">This work order doesn't have any attached images</p>
          </div>
        </div>
      </div>
    );
  }

  const currentImageFlagged = images[currentImageIndex]?.flagged || false;

  return (
    <div className="flex flex-col h-full">
      <MobileImageHeader
        isFlagged={currentImageFlagged}
        onFlagToggle={handleFlagToggle}
        onClose={onClose}
      />
      
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden relative"
        style={{ maxHeight: "calc(100% - 127px)" }} // Account for header and thumbnails
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && !loadedImages[currentImageIndex] && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="h-14 w-14 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <div className="relative w-full h-full flex items-center justify-center p-2">
          <img 
            src={images[currentImageIndex]?.url} 
            alt={`Service image ${currentImageIndex + 1}`}
            className="max-h-full max-w-full object-contain"
            style={{ 
              maxHeight: "100%", 
              maxWidth: "100%", 
              objectFit: "contain" 
            }}
            onLoad={handleImageLoad}
            draggable="false"
          />
        </div>

        {/* Left navigation arrow */}
        <div className="absolute left-2 inset-y-0 flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/70 hover:bg-white shadow-md text-gray-700"
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Right navigation arrow */}
        <div className="absolute right-2 inset-y-0 flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/70 hover:bg-white shadow-md text-gray-700"
            onClick={handleNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Fixed footer section with thumbnails */}
      <div className="w-full" style={{ minHeight: "90px" }}>
        <MobileThumbnails
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
        />
        
        <div className="py-2 px-3 bg-white text-center text-sm text-gray-600 border-t flex justify-between items-center">
          {/* Download button now on the left with ghost styling */}
          {onDownloadAll && (
            <Button 
              className="w-9 h-9 justify-center items-center p-0 text-gray-600 hover:bg-gray-100"
              variant="ghost"
              onClick={onDownloadAll}
              title="Download All Images"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="sr-only">Download All</span>
            </Button>
          )}
          
          {/* Image counter centered or right-aligned if download button exists */}
          <div className={onDownloadAll ? "flex-1 text-center" : "w-full text-center"}>
            {currentImageIndex + 1} of {images.length}
          </div>
          
          {/* Empty div to help with alignment when download button exists */}
          {onDownloadAll && <div className="w-9"></div>}
        </div>
      </div>
    </div>
  );
};
