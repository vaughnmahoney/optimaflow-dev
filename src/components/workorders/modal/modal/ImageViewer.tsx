
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  images: Array<{ url: string }>;
  currentImageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  currentOrderIndex: number;
  totalOrders: number;
  onNavigateOrder: (index: number) => void;
}

export const ImageViewer = ({
  images,
  currentImageIndex,
  onPrevious,
  onNext,
  currentOrderIndex,
  totalOrders,
  onNavigateOrder,
}: ImageViewerProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Main Image Container */}
      <div className="relative flex-1 min-h-0">
        {images.length > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img 
              src={images[currentImageIndex].url} 
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
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

      {/* Bottom Controls */}
      <div className="shrink-0 border-t bg-background">
        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="h-24 border-b">
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
        )}

        {/* Work Order Navigation */}
        <div className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => onNavigateOrder(currentOrderIndex - 1)}
              disabled={currentOrderIndex <= 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Order
            </Button>

            <span className="text-sm text-muted-foreground">
              Order {currentOrderIndex + 1} of {totalOrders}
            </span>

            <Button
              variant="outline"
              onClick={() => onNavigateOrder(currentOrderIndex + 1)}
              disabled={currentOrderIndex >= totalOrders - 1}
            >
              Next Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
