
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  images: Array<{ url: string }>;
  currentImageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const ImageViewer = ({
  images,
  currentImageIndex,
  onPrevious,
  onNext,
}: ImageViewerProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Main Image Container */}
      <div className="flex-1 relative min-h-0">
        {images.length > 0 ? (
          <div className="absolute inset-0 flex flex-col">
            {/* Image Counter */}
            <div className="absolute top-4 right-4 z-10 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm text-sm font-medium text-white shadow-lg">
              {currentImageIndex + 1} of {images.length} photos
            </div>

            {/* Main Image Container */}
            <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-black/5 to-black/10">
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={images[currentImageIndex].url} 
                  alt={`Image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain transition-opacity duration-300 animate-fade-in"
                />
              </div>
              
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all duration-200 border-2 border-white/10"
                    onClick={onPrevious}
                  >
                    <ChevronLeft className="h-8 w-8 text-white" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all duration-200 border-2 border-white/10"
                    onClick={onNext}
                  >
                    <ChevronRight className="h-8 w-8 text-white" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 text-muted-foreground">
              <ImageOff className="h-16 w-16 mx-auto" />
              <p className="text-lg font-medium">No images available</p>
              <p className="text-sm">This work order doesn't have any images attached.</p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="h-24 bg-black/5 backdrop-blur-sm border-t border-white/10">
          <div className="h-full flex items-center px-4 gap-2 overflow-x-auto">
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
                  "relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 shadow-lg",
                  index === currentImageIndex 
                    ? "ring-2 ring-white/80 ring-offset-2 ring-offset-black/20" 
                    : "opacity-50 hover:opacity-75"
                )}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
