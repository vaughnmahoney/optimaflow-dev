
import { ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageControlButtonsProps {
  isImageExpanded: boolean;
  zoomModeEnabled?: boolean;
  toggleZoomMode?: () => void;
}

export const ImageControlButtons = ({
  isImageExpanded,
  zoomModeEnabled,
  toggleZoomMode
}: ImageControlButtonsProps) => {
  return (
    <div className="absolute top-4 left-4 flex gap-2">
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
