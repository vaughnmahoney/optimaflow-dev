import React, { useEffect, useRef } from "react";
interface ImageThumbnailsProps {
  images: Array<{
    url: string;
  }>;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
}
export const ImageThumbnails = ({
  images,
  currentImageIndex,
  setCurrentImageIndex
}: ImageThumbnailsProps) => {
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // This effect handles scrolling the active thumbnail to center position
  useEffect(() => {
    if (!thumbnailsContainerRef.current || !activeItemRef.current || images.length === 0) return;
    const container = thumbnailsContainerRef.current;
    const activeItem = activeItemRef.current;

    // Calculate the position to scroll to (center the active thumbnail)
    const containerHeight = container.clientHeight;
    const thumbnailHeight = activeItem.clientHeight;
    const scrollTopTarget = activeItem.offsetTop - containerHeight / 2 + thumbnailHeight / 2;

    // Scroll to the calculated position with smooth behavior
    container.scrollTo({
      top: scrollTopTarget,
      behavior: 'smooth'
    });
  }, [currentImageIndex, images.length]);
  if (images.length === 0) return null;
  return <div className="w-20 h-full border-r overflow-hidden bg-gray-50 dark:bg-gray-900/50 flex flex-col">
      {/* Add arrows to indicate scroll direction when more thumbnails are available */}
      <div className="text-center text-gray-400 py-1 text-xs">
        {currentImageIndex > 0 && <div className="animate-bounce">↑</div>}
      </div>
      
      {/* Thumbnails container with fixed height and scrollable - prevent horizontal scrolling */}
      <div ref={thumbnailsContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 px-2 space-y-2" style={{
      scrollbarWidth: 'thin'
    }}>
        {images.map((image, idx) => <div key={idx} ref={idx === currentImageIndex ? activeItemRef : null} className={`relative h-16 w-16 mx-auto flex-shrink-0 cursor-pointer transition-all duration-200 ${idx === currentImageIndex ? 'border-2 border-primary shadow-sm scale-[1.05] z-10' : 'border border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'} rounded-md overflow-hidden`} onClick={() => setCurrentImageIndex(idx)}>
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={image.url} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
              
              {/* Image number indicator */}
              <span className="absolute bottom-0 right-0 text-[10px] bg-black/60 text-white px-1 rounded-tl-sm">
                {idx + 1}
              </span>
            </div>
          </div>)}
      </div>
      
      {/* Bottom arrow indicator */}
      <div className="text-center text-gray-400 py-1 text-xs">
        {currentImageIndex < images.length - 1}
      </div>
    </div>;
};