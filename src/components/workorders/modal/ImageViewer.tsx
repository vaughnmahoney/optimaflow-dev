
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { WorkOrderCompletionResponse } from "../types";

interface ImageViewerProps {
  images: WorkOrderCompletionResponse['photos'];
  currentImageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const ImageViewer = ({ 
  images = [], 
  currentImageIndex, 
  onPrevious, 
  onNext 
}: ImageViewerProps) => {
  return (
    <div className="flex-1 relative flex items-center justify-center">
      {images.length > 0 ? (
        <>
          <img 
            src={images[currentImageIndex]?.url} 
            alt={`Image ${currentImageIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 hover:bg-background/20"
                onClick={onPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 hover:bg-background/20"
                onClick={onNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}
        </>
      ) : (
        <div className="text-center space-y-4 text-muted-foreground">
          <ImageOff className="h-16 w-16 mx-auto" />
          <p className="text-lg font-medium">No images available</p>
          <p className="text-sm">This work order doesn't have any images attached.</p>
        </div>
      )}
    </div>
  );
};
