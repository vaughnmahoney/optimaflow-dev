import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
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
  return <div className="absolute inset-0 flex flex-col">
      {/* Main Image Container */}
      <div className="flex-1 relative">
        {images.length > 0 ? <div className="absolute inset-0 flex items-center justify-center py-0 my-0 px-0">
            <img src={images[currentImageIndex].url} alt={`Image ${currentImageIndex + 1}`} className="max-w-full max-h-full object-contain" />
            
            {images.length > 1 && <>
                <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/10 hover:bg-background/20" onClick={onPrevious}>
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/10 hover:bg-background/20" onClick={onNext}>
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>}
          </div> : <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 text-muted-foreground">
              <ImageOff className="h-16 w-16 mx-auto" />
              <p className="text-lg font-medium">No images available</p>
              <p className="text-sm">This work order doesn't have any images attached.</p>
            </div>
          </div>}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && <div className="h-24 border-t bg-background">
          <div className="h-full flex items-center gap-2 overflow-x-auto px-[16px]">
            {images.map((image, index) => <button key={index} onClick={() => {
          if (index < currentImageIndex) {
            onPrevious();
          } else if (index > currentImageIndex) {
            onNext();
          }
        }} className={cn("h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200", index === currentImageIndex ? "border-primary opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-75")}>
                <img src={image.url} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
              </button>)}
          </div>
        </div>}
    </div>;
};