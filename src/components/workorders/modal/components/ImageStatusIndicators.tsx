
interface ImageStatusIndicatorsProps {
  currentIndex: number;
  totalImages: number;
  zoomLevel?: number;
  isImageExpanded?: boolean;
}

export const ImageStatusIndicators = ({
  currentIndex,
  totalImages,
  zoomLevel = 1,
  isImageExpanded = false
}: ImageStatusIndicatorsProps) => {
  return (
    <>
      {/* Image counter */}
      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentIndex + 1} / {totalImages}
      </div>
      
      {/* Zoom indicator - only show when zoomed */}
      {isImageExpanded && zoomLevel !== 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
          {Math.round(zoomLevel * 100)}%
        </div>
      )}
    </>
  );
};
