
import { useState } from "react";

interface UseImageViewerProps {
  images: string[];
  initialIndex?: number;
}

export function useImageViewer({ images, initialIndex = 0 }: UseImageViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  
  const totalImages = images.length;
  const currentImage = images[currentImageIndex] || null;
  
  const nextImage = () => {
    if (totalImages > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    }
  };
  
  const previousImage = () => {
    if (totalImages > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };
  
  const goToImage = (index: number) => {
    if (index >= 0 && index < totalImages) {
      setCurrentImageIndex(index);
    }
  };
  
  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };
  
  return {
    currentImageIndex,
    setCurrentImageIndex,
    currentImage,
    totalImages,
    nextImage,
    previousImage,
    goToImage,
    isImageExpanded,
    toggleImageExpand
  };
}
