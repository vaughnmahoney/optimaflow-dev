
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageViewerProps {
  images: any[];
  currentImageIndex: number;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onImageSelect: (index: number) => void;
}

export const ImageViewer = ({
  images,
  currentImageIndex,
  isLoading,
  onPrevious,
  onNext,
  onImageSelect,
}: ImageViewerProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!images?.length) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground">
        No images available
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  if (!currentImage?.image_url) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading image. The image URL is not available.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative h-full flex flex-col space-y-4">
      <div className="relative flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {imageError && (
          <Alert variant="destructive" className="absolute top-4 left-4 right-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{imageError}</AlertDescription>
          </Alert>
        )}
        <img
          src={currentImage.image_url}
          alt={`Service image ${currentImageIndex + 1}`}
          className={`max-h-[calc(90vh-12rem)] max-w-full object-contain transition-opacity duration-300 ${
            isImageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => {
            setIsImageLoading(false);
            setImageError(null);
          }}
          onError={() => {
            setIsImageLoading(false);
            setImageError("Failed to load image. Please try again later.");
          }}
        />
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
          onClick={onPrevious}
          disabled={currentImageIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
          onClick={onNext}
          disabled={currentImageIndex === images.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="absolute top-4 right-4 bg-white/90 px-4 py-2 rounded-full text-sm shadow-lg">
          Image {currentImageIndex + 1} of {images.length}
        </div>
      </div>

      <div className="flex justify-center space-x-2 h-20 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => onImageSelect(index)}
            className={`h-full aspect-square rounded-lg overflow-hidden transition-all ${
              index === currentImageIndex 
                ? 'ring-2 ring-primary ring-offset-2' 
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={image.image_url}
              alt={`Thumbnail ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
