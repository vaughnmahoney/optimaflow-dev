
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Flag } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { ImageType } from "../../../types/image";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";

interface MobileImageViewerProps {
  workOrderId: string;
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  onClose: () => void;
}

export const MobileImageViewer = ({
  workOrderId,
  images,
  currentImageIndex,
  setCurrentImageIndex,
  onClose,
}: MobileImageViewerProps) => {
  // Track loaded images to prevent unnecessary loading states
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { toggleImageFlag } = useWorkOrderMutations();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);
  
  const minSwipeDistance = 50;
  
  // Preload adjacent images
  useEffect(() => {
    if (images.length <= 1) return;
    
    const preloadImage = (index: number) => {
      if (index >= 0 && index < images.length) {
        const img = new Image();
        img.src = images[index].url;
        img.onload = () => {
          setLoadedImages(prev => ({...prev, [index]: true}));
        };
      }
    };
    
    // Only show loading on initial load or when image hasn't been loaded yet
    if (!loadedImages[currentImageIndex]) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
    
    // Preload next and previous images
    if (currentImageIndex < images.length - 1) {
      preloadImage(currentImageIndex + 1);
    }
    if (currentImageIndex > 0) {
      preloadImage(currentImageIndex - 1);
    }
  }, [images, currentImageIndex, loadedImages]);
  
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
  
  const handleImageLoad = () => {
    setIsLoading(false);
    setLoadedImages(prev => ({...prev, [currentImageIndex]: true}));
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  const handleFlagToggle = () => {
    if (images.length <= 0 || currentImageIndex < 0) return;
    
    const currentImage = images[currentImageIndex];
    const isFlagged = !currentImage.flagged;
    
    toggleImageFlag(workOrderId, currentImageIndex, isFlagged);
  };
  
  useEffect(() => {
    if (!thumbnailsContainerRef.current || !activeThumbRef.current) return;
    
    const container = thumbnailsContainerRef.current;
    const activeThumb = activeThumbRef.current;
    
    const scrollLeft = activeThumb.offsetLeft - (container.clientWidth / 2) + (activeThumb.clientWidth / 2);
    
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    });
  }, [currentImageIndex]);

  if (images.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 flex justify-between items-center border-b bg-white">
          <h3 className="font-medium">Images</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
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
      <div className="p-3 flex justify-between items-center border-b bg-white">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleFlagToggle} 
          className={`flex items-center gap-1 ${currentImageFlagged ? "text-red-500" : ""}`}
        >
          <Flag className={`h-4 w-4 ${currentImageFlagged ? "fill-red-500" : ""}`} />
          <span>{currentImageFlagged ? "Flagged" : "Flag"}</span>
        </Button>
        <span className="font-medium">Images</span>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
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
      
      <div className="p-2 border-t bg-white">
        <div 
          ref={thumbnailsContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-none"
        >
          {images.map((image, idx) => (
            <div 
              key={idx} 
              ref={idx === currentImageIndex ? activeThumbRef : null}
              onClick={() => setCurrentImageIndex(idx)}
              className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 w-16 h-16 ${
                idx === currentImageIndex 
                  ? 'border-2 border-primary shadow-sm scale-[1.05] z-10' 
                  : 'border border-gray-200 opacity-70 hover:opacity-100'
              } rounded-md overflow-hidden`}
            >
              <img 
                src={image.url} 
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              
              {image.flagged && (
                <div className="absolute top-0 right-0 bg-red-500 p-1 rounded-bl-md">
                  <Flag className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="py-2 bg-white text-center text-sm text-gray-600 border-t">
        {currentImageIndex + 1} of {images.length}
      </div>
    </div>
  );
};
