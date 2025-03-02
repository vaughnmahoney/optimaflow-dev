
import { useState } from 'react';

export const useImageNavigation = (totalImages: number) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrevious = () => {
    if (isTransitioning || totalImages === 0) return;
    
    setIsTransitioning(true);
    
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    } else {
      setCurrentImageIndex(totalImages - 1);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const handleNext = () => {
    if (isTransitioning || totalImages === 0) return;
    
    setIsTransitioning(true);
    
    if (currentImageIndex < totalImages - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setCurrentImageIndex(0);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  return {
    currentImageIndex,
    setCurrentImageIndex,
    handlePrevious,
    handleNext,
    isTransitioning
  };
};
