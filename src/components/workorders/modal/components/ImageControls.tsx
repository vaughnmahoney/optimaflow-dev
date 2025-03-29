// This file is no longer used as the controls are now directly integrated into the ImageViewer
// Keeping the file as a placeholder to prevent import errors, but it should be refactored
// in a future update to remove references to this component.

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn } from "lucide-react";

interface ImageControlsProps {
  imagesCount: number;
  currentImageIndex: number;
  handlePrevious: () => void;
  handleNext: () => void;
  isImageExpanded: boolean;
  toggleImageExpand: () => void;
  zoomModeEnabled: boolean;
  toggleZoomMode: () => void;
  zoomLevel: number;
}

export const ImageControls = ({
  imagesCount,
  currentImageIndex,
  handlePrevious,
  handleNext,
  isImageExpanded,
  toggleImageExpand,
  zoomModeEnabled,
  toggleZoomMode,
  zoomLevel
}: ImageControlsProps) => {
  // This component is no longer used directly.
  // See ImageViewer.tsx for the integrated controls.
  return null;
};
