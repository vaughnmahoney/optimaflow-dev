import { useRef, useEffect } from "react";
import { ImageThumbnail } from "./ImageThumbnail";
import { ImageType } from "@/components/workorders/types/image";

interface MobileThumbnailsProps {
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
}

export const MobileThumbnails = ({
  images,
  currentImageIndex,
  setCurrentImageIndex
}: MobileThumbnailsProps) => {
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLDivElement>(null);

  // Scroll to keep the active thumbnail visible
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

  return (
    <div className="py-3 border-t bg-white">
      <div 
        ref={thumbnailsContainerRef}
        className="flex gap-3 overflow-x-auto px-4 mx-auto scrollbar-hide no-scrollbar"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory'
        }}
      >
        <div className="flex gap-3 px-2">
          {images.map((image, idx) => (
            <ImageThumbnail
              key={idx}
              ref={idx === currentImageIndex ? activeThumbRef : null}
              image={image}
              index={idx}
              isActive={idx === currentImageIndex}
              onClick={() => setCurrentImageIndex(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
