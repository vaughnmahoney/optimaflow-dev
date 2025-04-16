
import { useState, useEffect } from "react";
import { ImageType } from "@/components/workorders/types/image";

/**
 * Hook to manage image preloading and loading states
 */
export const useImagePreloading = (images: ImageType[], currentImageIndex: number) => {
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Handle preloading of images and manage loading state
  useEffect(() => {
    if (images.length <= 1) return;
    
    const preloadImage = (index: number) => {
      if (index >= 0 && index < images.length) {
        const img = new Image();
        img.src = images[index].url;
        img.onload = () => {
          setLoadedImages(prev => ({ ...prev, [index]: true }));
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

  const handleImageLoad = () => {
    setIsLoading(false);
    setLoadedImages(prev => ({ ...prev, [currentImageIndex]: true }));
  };

  return {
    isLoading,
    loadedImages,
    handleImageLoad
  };
};
