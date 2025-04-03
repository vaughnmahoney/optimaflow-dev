
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { ImageType } from "../../../types/image";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { useImagePreloading } from "@/hooks/useImagePreloading";
import { useTouchGestures } from "@/hooks/useTouchGestures";
import { MobileImageHeader } from "./MobileImageHeader";
import { MobileThumbnails } from "./MobileThumbnails";
import { Download, Images } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && !loadedImages[currentImageIndex] && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="h-14 w-14 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img 
          src={images[currentImageIndex]?.url} 
          alt={`Service image ${currentImageIndex + 1}`}
          className="max-h-full max-w-full object-contain"
          onLoad={handleImageLoad}
          draggable="false"
        />
      </div>
      
      <MobileThumbnails
        images={images}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
      />
      
      <div className="py-2 px-3 bg-white text-center text-sm text-gray-600 border-t flex justify-between items-center">
        {/* Download button with improved styling */}
        {onDownloadAll && (
          <Button 
            className="h-10 w-10 p-0 flex justify-center items-center text-gray-600 hover:bg-gray-100"
            variant="ghost"
            onClick={onDownloadAll}
            title="Download All Images"
          >
            <Download className="h-5 w-5" /> {/* Increased icon size */}
            <span className="sr-only">Download All</span>
          </Button>
        )}
        
        {/* Image counter with improved styling */}
        <div className="flex items-center justify-center gap-1.5">
          <div className="relative">
            <Images className="h-5 w-5 text-gray-500" /> {/* Increased icon size */}
            <Badge 
              variant="destructive" 
              className="absolute -top-2.5 -right-2.5 px-1.5 min-w-5 h-5 flex items-center justify-center text-[11px] font-medium rounded-md"
            >
              {images.length}
            </Badge>
          </div>
          <span>{currentImageIndex + 1} of {images.length}</span>
        </div>
        
        {/* Empty div to help with alignment when download button exists */}
        {onDownloadAll && <div className="w-10"></div>}
      </div>
    </div>
  );
};
