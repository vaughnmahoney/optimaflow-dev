
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageType } from "../types/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageType[];
  initialImageIndex?: number;
}

export const MobileImageViewerModal = ({
  isOpen,
  onClose,
  images,
  initialImageIndex = 0
}: MobileImageViewerModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  
  if (images.length === 0) return null;
  
  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      setCurrentImageIndex(images.length - 1);
    }
  };
  
  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setCurrentImageIndex(0);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 w-full h-[90vh] flex flex-col bg-background">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b">
          <div className="text-sm font-medium">
            Image {currentImageIndex + 1} of {images.length}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Main image */}
        <div className="flex-1 relative flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <img 
            src={images[currentImageIndex]?.url} 
            alt={`Image ${currentImageIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
          
          {/* Navigation buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-black/50 shadow-md"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-black/50 shadow-md"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Thumbnails */}
        <ScrollArea className="h-24 border-t">
          <div className="flex p-2 space-x-2 overflow-x-auto">
            {images.map((image, index) => (
              <div 
                key={index} 
                onClick={() => setCurrentImageIndex(index)}
                className={`cursor-pointer h-16 w-16 flex-shrink-0 border-2 rounded-md overflow-hidden ${
                  index === currentImageIndex ? 'border-primary' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <img 
                  src={image.url} 
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
