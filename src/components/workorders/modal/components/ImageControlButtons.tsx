
import { Flag, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageControlButtonsProps {
  currentImageFlagged: boolean;
  handleFlagToggle: () => void;
  isImageExpanded: boolean;
  zoomModeEnabled?: boolean;
  toggleZoomMode?: () => void;
}

export const ImageControlButtons = ({
  currentImageFlagged,
  handleFlagToggle,
  isImageExpanded,
  zoomModeEnabled,
  toggleZoomMode
}: ImageControlButtonsProps) => {
  return (
    <div className="absolute top-4 left-4 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleFlagToggle}
        className={`h-10 w-10 rounded-full ${
          currentImageFlagged 
            ? "bg-red-100 hover:bg-red-50 border-red-300 text-red-600" 
            : "bg-white/90 hover:bg-white border-gray-200 text-gray-700"
        } shadow-md`}
      >
        <Flag className={`h-4 w-4 ${currentImageFlagged ? "fill-red-500" : ""}`} />
      </Button>
      
      {isImageExpanded && toggleZoomMode && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleZoomMode}
          className={`h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 text-gray-700 shadow-md ${zoomModeEnabled ? 'bg-blue-100 border-blue-300' : ''}`}
        >
          <ZoomIn className={`h-4 w-4 ${zoomModeEnabled ? 'text-blue-500' : ''}`} />
        </Button>
      )}
    </div>
  );
};
