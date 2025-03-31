import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { ImageType } from "../../../types/image";

interface MobileImageViewerProps {
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  onClose: () => void;
}

export const MobileImageViewer = ({
  images,
  currentImageIndex,
  setCurrentImageIndex,
  onClose,
}: MobileImageViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);
  
  // Minimum swipe distance to trigger nav (in px)
  const minSwipeDistance = 50;
  
  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setIsLoading(true);
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (images.length > 0) {
      setIsLoading(true);
      setCurrentImageIndex(images.length - 1);
    }
  };
  
  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setIsLoading(true);
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (images.length > 0) {
      setIsLoading(true);
      setCurrentImageIndex(0);
    }
  };
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  // Touch event handlers for swipe navigation
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
  
  // Keep the active thumbnail scrolled into view
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 flex justify-between items-center border-b bg-white">
        <Button variant="ghost" size="sm" onClick={onClose} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <span className="font-medium">Images</span>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Main image viewer */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Show skeleton while loading */}
        {isLoading && (
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
      
      {/* Thumbnails */}
      <div className="p-2 border-t bg-white">
        <div 
          ref={thumbnailsContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300"
          style={{ scrollbarWidth: 'thin' }}
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
            </div>
          ))}
        </div>
      </div>
      
      {/* Counter */}
      <div className="py-2 bg-white text-center text-sm text-gray-600 border-t">
        {currentImageIndex + 1} of {images.length}
      </div>
    </div>
  );
};
