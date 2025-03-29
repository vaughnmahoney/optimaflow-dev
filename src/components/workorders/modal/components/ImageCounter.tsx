
import React from 'react';

interface ImageCounterProps {
  currentIndex: number;
  totalImages: number;
}

export const ImageCounter: React.FC<ImageCounterProps> = ({ 
  currentIndex, 
  totalImages 
}) => {
  return (
    <div className="flex items-center justify-center bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">
      <span>{currentIndex + 1}</span>
      <span className="mx-1">/</span>
      <span>{totalImages}</span>
    </div>
  );
};
