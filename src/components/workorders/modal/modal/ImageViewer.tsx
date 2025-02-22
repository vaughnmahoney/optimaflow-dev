
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ImageViewerProps {
  images: Array<{
    url: string;
  }>;
  currentImageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const ImageViewer = ({
  images,
  currentImageIndex,
  onPrevious,
  onNext
}: ImageViewerProps) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div 
      className="absolute inset-0 flex flex-col bg-black/5 backdrop-blur-sm"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main Image Container */}
      <div className="flex-1 relative">
        {images.length > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Image with fade animation */}
              <img 
                src={images[currentImageIndex].url} 
                alt={`Image ${currentImageIndex + 1}`} 
                className="w-full h-full object-contain animate-fade-in"
                style={{ animationDuration: '0.5s' }}
              />
              
              {/* Navigation overlay - appears on hover */}
              <div className={cn(
                "absolute inset-0 transition-opacity duration-300",
                isHovering ? "opacity-100" : "opacity-0"
              )}>
                {/* Left gradient overlay */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black/20 to-transparent" />
                
                {/* Right gradient overlay */}
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/20 to-transparent" />
                
                {images.length > 1 && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 border border-white/20"
                      onClick={onPrevious}
                    >
                      <ChevronLeft className="h-8 w-8 text-white" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 border border-white/20"
                      onClick={onNext}
                    >
                      <ChevronRight className="h-8 w-8 text-white" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
            <div className="text-center space-y-4 text-muted-foreground animate-fade-in">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                <ImageOff className="h-20 w-20 mx-auto relative z-10 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-lg font-medium">No images available</p>
              <p className="text-sm">This work order doesn't have any images attached.</p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Strip with frosted glass effect */}
      {images.length > 1 && (
        <div className="h-24 backdrop-blur-md bg-white/10 border-t border-white/20">
          <div className="h-full flex items-center gap-2 overflow-x-auto px-4 py-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index < currentImageIndex) {
                    onPrevious();
                  } else if (index > currentImageIndex) {
                    onNext();
                  }
                }}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105",
                  index === currentImageIndex 
                    ? "ring-2 ring-white shadow-lg" 
                    : "opacity-50 hover:opacity-75"
                )}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === currentImageIndex && (
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
