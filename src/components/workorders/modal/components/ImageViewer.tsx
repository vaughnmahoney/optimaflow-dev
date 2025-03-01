
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

interface ImageViewerProps {
  images: Array<{ url: string }>;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
}

export const ImageViewer = ({
  images,
  currentImageIndex,
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand,
}: ImageViewerProps) => {
  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(images.length - 1);
    }
  };
  
  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(0);
    }
  };

  return (
    <div className="relative flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-hidden h-full w-full">
      {images.length > 0 ? (
        <>
          <img 
            src={images[currentImageIndex]?.url} 
            alt={`Service image ${currentImageIndex + 1}`}
            className="max-h-full max-w-full object-contain cursor-pointer transition-transform hover:scale-[1.01]"
            onClick={toggleImageExpand}
          />
          
          {/* Image counter */}
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
          
          {/* Previous/Next buttons */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow-md ml-2"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="absolute inset-y-0 right-0 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow-md mr-2"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Expand/Collapse button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleImageExpand}
            className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow-md"
          >
            {isImageExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </>
      ) : (
        <div className="text-center text-muted-foreground p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="h-16 w-16 mx-auto mb-4 text-gray-400 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <span className="text-2xl">×</span>
          </div>
          <p className="text-lg font-medium">No images available</p>
          <p className="text-sm">This work order doesn't have any uploaded images.</p>
        </div>
      )}
    </div>
  );
};
