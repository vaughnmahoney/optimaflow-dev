
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 overflow-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => {
              if (index !== currentImageIndex) {
                if (index < currentImageIndex) {
                  onPrevious();
                } else if (index > currentImageIndex) {
                  onNext();
                }
              }
              setShowModal(true);
            }}
            className={cn(
              "relative aspect-square rounded-lg overflow-hidden group hover:ring-2 hover:ring-primary/50 transition-all duration-200",
              index === currentImageIndex && "ring-2 ring-primary"
            )}
          >
            <img
              src={image.url}
              alt={`Image ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* Modal Image Viewer */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl p-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-50"
            onClick={() => setShowModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="relative aspect-video">
            <img
              src={images[currentImageIndex].url}
              alt={`Image ${currentImageIndex + 1}`}
              className="h-full w-full object-contain"
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
          <div className="h-24 border-t bg-background">
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
                    "h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200",
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
        </DialogContent>
      </Dialog>
    </div>
  );
};
