
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Image, FileText } from "lucide-react";

interface NavigationControlsProps {
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  currentImageIndex: number;
  totalImages: number;
  onPreviousImage: () => void;
  onNextImage: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  currentImageIndex,
  totalImages,
  onPreviousImage,
  onNextImage
}) => {
  return (
    <div className="p-2 border-t flex items-center justify-between bg-gray-50 text-xs text-gray-500">
      {/* Work Order Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={currentIndex <= 0}
          className="h-7 px-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <FileText className="h-3.5 w-3.5 ml-1" />
        </Button>
        
        <span>
          Work Order {currentIndex + 1} of {totalCount}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={currentIndex >= totalCount - 1}
          className="h-7 px-2"
        >
          <FileText className="h-3.5 w-3.5 mr-1" />
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Image Navigation */}
      {totalImages > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPreviousImage}
            disabled={totalImages <= 1}
            className="h-7 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <Image className="h-3.5 w-3.5 ml-1" />
          </Button>
          
          <span>
            Image {currentImageIndex + 1} of {totalImages}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onNextImage}
            disabled={totalImages <= 1}
            className="h-7 px-2"
          >
            <Image className="h-3.5 w-3.5 mr-1" />
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Keyboard shortcuts info */}
      <div className="hidden sm:block text-xs text-gray-400">
        <span>Tip: Use arrow keys to navigate (Alt+Arrows for work orders)</span>
      </div>
    </div>
  );
};
