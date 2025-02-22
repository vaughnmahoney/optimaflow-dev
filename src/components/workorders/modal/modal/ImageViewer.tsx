
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff, Grid, Maximize2 } from "lucide-react";
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
  const [isGridView, setIsGridView] = useState(false);

  if (images.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 text-muted-foreground">
          <ImageOff className="h-16 w-16 mx-auto" />
          <p className="text-lg font-medium">No images available</p>
          <p className="text-sm">This work order doesn't have any images attached.</p>
        </div>
      </div>
    );
  }

  if (isGridView) {
    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="p-4 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsGridView(false)}
            className="hover:bg-background/20"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsGridView(false);
                  while (currentImageIndex !== index) {
                    if (index > currentImageIndex) {
                      onNext();
                    } else {
                      onPrevious();
                    }
                  }
                }}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden group hover:ring-2 hover:ring-primary transition-all duration-200",
                  index === currentImageIndex && "ring-2 ring-primary"
                )}
              >
                <img
                  src={image.url}
                  alt={`Image ${index + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Main Image View */}
      <div className="flex-1 relative">
        <div className="absolute right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsGridView(true)}
            className="hover:bg-background/20"
          >
            <Grid className="h-5 w-5" />
          </Button>
        </div>

        <img
          src={images[currentImageIndex].url}
          alt={`Image ${currentImageIndex + 1}`}
          className="absolute inset-0 h-full w-full object-contain"
        />
        
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/10 hover:bg-background/20"
              onClick={onPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/10 hover:bg-background/20"
              onClick={onNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="h-32 border-t bg-background">
        <div className="h-full flex items-center gap-2 overflow-x-auto px-4">
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
                "h-24 w-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200",
                index === currentImageIndex
                  ? "border-primary opacity-100 scale-105"
                  : "border-transparent opacity-50 hover:opacity-75"
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
    </div>
  );
};
