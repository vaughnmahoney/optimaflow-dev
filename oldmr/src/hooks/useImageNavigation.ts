
import { useState, useEffect } from "react";

interface UseImageNavigationProps {
  totalImages: number;
  onPreviousWorkOrder: () => void;
  onNextWorkOrder: () => void;
  isTransitioning: boolean;
}

export const useImageNavigation = ({
  totalImages,
  onPreviousWorkOrder,
  onNextWorkOrder,
  isTransitioning
}: UseImageNavigationProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevious = () => {
    if (isTransitioning) return;
    
    if (currentImageIndex === 0) {
      onPreviousWorkOrder();
    } else {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (isTransitioning) return;
    
    if (currentImageIndex === totalImages - 1) {
      onNextWorkOrder();
    } else {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isTransitioning) return;
      
      switch (e.key) {
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentImageIndex, totalImages, isTransitioning]);

  return {
    currentImageIndex,
    setCurrentImageIndex,
    handlePrevious,
    handleNext
  };
};
