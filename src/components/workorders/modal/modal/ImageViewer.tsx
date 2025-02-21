
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
      <div className="flex-1 relative">
        {images.length > 0 ? (
          <div className="absolute inset-0">
            {/* Image Counter */}
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium">
              {currentImageIndex + 1} of {images.length} photos
            </div>

            {/* Main Image with dark overlay gradient */}
            <div className="relative h-full flex items-center justify-center bg-black/5">
              <img 
                src={images[currentImageIndex].url} 
                alt={`Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain animate-fade-in"
              />
              
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/60 backdrop-blur-sm transition-all duration-200"
                    onClick={onPrevious}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/60 backdrop-blur-sm transition-all duration-200"
                    onClick={onNext}
                  >
                    <ChevronRight className="h-8 w-8" />
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
        <div className="h-24 bg-background/80 backdrop-blur-sm border-t">
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
                  "relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden transition-all duration-200 hover:scale-105",
                  index === currentImageIndex 
                    ? "ring-2 ring-primary ring-offset-2 shadow-lg" 
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
