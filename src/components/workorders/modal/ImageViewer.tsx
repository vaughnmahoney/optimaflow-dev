
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WorkOrderCompletionResponse } from "../types";

interface ImageViewerProps {
  completionResponse: WorkOrderCompletionResponse | undefined;
  currentImageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const ImageViewer = ({
  completionResponse,
  currentImageIndex,
  onPrevious,
  onNext
}: ImageViewerProps) => {
  const images = completionResponse?.orders?.[0]?.data?.form?.images || [];

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No images available</p>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center h-full">
      <div className="max-h-full max-w-full overflow-hidden">
        <img
          src={images[currentImageIndex]?.url}
          alt={`Image ${currentImageIndex + 1}`}
          className="object-contain max-h-[70vh] w-auto"
        />
      </div>

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
    </div>
  );
};
