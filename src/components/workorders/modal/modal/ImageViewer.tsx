
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

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
    <div className="flex-1 relative bg-white">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {images.length > 0 ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={images[currentImageIndex].url} 
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              style={{ width: 'auto', height: 'auto' }}
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 hover:bg-background/20"
                  onClick={onPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-background/20"
                  onClick={onNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4 text-muted-foreground">
            <ImageOff className="h-16 w-16 mx-auto" />
            <p className="text-lg font-medium">No images available</p>
            <p className="text-sm">This work order doesn't have any images attached.</p>
          </div>
        )}
      </div>
    </div>
  );
};
