
import React from "react";
import { ImageType } from "../../types/image";

interface ImageGridProps {
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
}

export const ImageGrid = ({
  images,
  currentImageIndex,
  setCurrentImageIndex
}: ImageGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 p-2 overflow-y-auto">
      {images.map((image, idx) => (
        <div 
          key={idx} 
          className={`aspect-square rounded-md overflow-hidden border-2 ${
            idx === currentImageIndex 
              ? 'border-primary shadow' 
              : 'border-transparent'
          }`}
          onClick={() => setCurrentImageIndex(idx)}
        >
          <img 
            src={image.url} 
            alt={`Image ${idx + 1}`} 
            className="h-full w-full object-cover" 
          />
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {idx + 1}/{images.length}
          </div>
        </div>
      ))}
    </div>
  );
};
