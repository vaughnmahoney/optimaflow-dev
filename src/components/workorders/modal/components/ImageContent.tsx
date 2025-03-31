
import React from "react";
import { ImageType } from "../../types/image";
import { ImageViewer } from "./ImageViewer";
import { ImageThumbnails } from "./ImageThumbnails";
import { ImageEmptyState } from "./ImageEmptyState";
import { ImageGrid } from "./ImageGrid";
import { Button } from "@/components/ui/button";
import { Grid2X2, Image } from "lucide-react";

interface ImageContentProps {
  images: ImageType[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
  isMobile?: boolean;
  showImagesGrid?: boolean;
  toggleImagesGrid?: () => void;
}

export function ImageContent({ 
  images, 
  currentImageIndex, 
  setCurrentImageIndex,
  isImageExpanded,
  toggleImageExpand,
  isMobile = false,
  showImagesGrid = false,
  toggleImagesGrid = () => {}
}: ImageContentProps) {
  if (images.length === 0) {
    return <ImageEmptyState />;
  }

  // If on mobile and grid view is active, show grid instead of single image
  if (isMobile && showImagesGrid) {
    return (
      <div className="flex flex-1 h-full flex-col overflow-hidden">
        <div className="p-2 border-b">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleImagesGrid}
            className="w-full"
          >
            <Image className="h-4 w-4 mr-2" />
            View Single Image
          </Button>
        </div>
        <ImageGrid
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={(index) => {
            setCurrentImageIndex(index);
            toggleImagesGrid();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Thumbnails - only shown on desktop */}
      {!isMobile && (
        <ImageThumbnails
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
        />
      )}
      
      {/* Main image viewer */}
      <div className={`relative flex-1 ${isImageExpanded ? 'max-h-full' : 'max-h-[60vh]'} ${isMobile ? 'max-h-[50vh]' : ''}`}>
        <ImageViewer 
          images={images}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          isImageExpanded={isImageExpanded}
          toggleImageExpand={toggleImageExpand}
          isMobile={isMobile}
          toggleImagesGrid={toggleImagesGrid}
          totalImages={images.length}
        />
      </div>
    </div>
  );
}
