
import React from "react";

interface ImageThumbnailsProps {
  images: Array<{ url: string }>;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
}

export const ImageThumbnails = ({
  images,
  currentImageIndex,
  setCurrentImageIndex,
}: ImageThumbnailsProps) => {
  if (images.length === 0) return null;

  return (
    <div className="w-20 h-full border-r overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-2">
      {images.map((image, idx) => (
        <div 
          key={idx}
          className={`relative h-16 w-16 flex-shrink-0 cursor-pointer transition-all duration-200 ${
            idx === currentImageIndex 
              ? 'border-l-2 border-l-primary shadow-sm scale-[1.02]' 
              : 'border border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'
          } rounded-md overflow-hidden`}
          onClick={() => setCurrentImageIndex(idx)}
        >
          <img 
            src={image.url} 
            alt={`Thumbnail ${idx + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};
