
import { useState, useRef, useEffect } from "react";

interface ZoomState {
  zoomLevel: number;
  position: { x: number; y: number };
  zoomModeEnabled: boolean;
  lastMousePosition: { x: number; y: number };
}

interface UseImageZoomProps {
  isImageExpanded: boolean;
}

export const useImageZoom = ({ isImageExpanded }: UseImageZoomProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoomModeEnabled, setZoomModeEnabled] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleZoomMode = () => {
    setZoomModeEnabled(!zoomModeEnabled);
    
    // If turning off zoom mode, reset zoom
    if (zoomModeEnabled) {
      resetZoom();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!zoomModeEnabled || !isImageExpanded) return;
    
    const imageRect = imageRef.current?.getBoundingClientRect();
    if (!imageRect) return;
    
    // Store the current mouse position relative to the image
    setLastMousePosition({
      x: e.clientX - imageRect.left,
      y: e.clientY - imageRect.top
    });
  };

  const handleZoomWheel = (e: WheelEvent) => {
    if (!zoomModeEnabled || !isImageExpanded) return;
    
    e.preventDefault();
    
    const imageRect = imageRef.current?.getBoundingClientRect();
    if (!imageRect) return;
    
    // Calculate where the wheel event occurred as a percentage of the image dimensions
    const mouseX = (e.clientX - imageRect.left) / imageRect.width;
    const mouseY = (e.clientY - imageRect.top) / imageRect.height;
    
    // Determine zoom change direction and amount
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    const newZoomLevel = Math.max(1, Math.min(5, zoomLevel + delta));
    
    // If zooming out completely, reset position
    if (newZoomLevel === 1) {
      resetZoom();
      return;
    }
    
    if (zoomLevel === 1 && newZoomLevel > 1) {
      // Initial zoom in - center on mouse position
      setPosition({
        x: (0.5 - mouseX) * imageRect.width,
        y: (0.5 - mouseY) * imageRect.height
      });
    } else if (newZoomLevel > 1) {
      // Improved position calculation to maintain mouse point as zoom center
      const scaleChange = newZoomLevel / zoomLevel;
      
      // Calculate new position to maintain mouse point as zoom center
      setPosition({
        x: (position.x + (e.clientX - imageRect.left - imageRect.width / 2)) * scaleChange - (e.clientX - imageRect.left - imageRect.width / 2),
        y: (position.y + (e.clientY - imageRect.top - imageRect.height / 2)) * scaleChange - (e.clientY - imageRect.top - imageRect.height / 2)
      });
    }
    
    // Update zoom level
    setZoomLevel(newZoomLevel);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isImageExpanded) return false;
    
    // Only handle zoom if zoom mode is enabled
    if (!zoomModeEnabled) return false;
    
    if (zoomLevel === 1) {
      const imageRect = imageRef.current?.getBoundingClientRect();
      if (!imageRect) return true;
      
      // Calculate where the click occurred relative to the image center
      const clickOffsetX = e.clientX - imageRect.left - (imageRect.width / 2);
      const clickOffsetY = e.clientY - imageRect.top - (imageRect.height / 2);
      
      // Zoom in centered on the click position
      setZoomLevel(2);
      
      // Calculate position offset to center the clicked point
      setPosition({
        x: -clickOffsetX,
        y: -clickOffsetY
      });
      
      // Store this position for further zoom operations
      setLastMousePosition({
        x: e.clientX - imageRect.left,
        y: e.clientY - imageRect.top
      });
    } else {
      // Reset zoom when clicking while already zoomed
      resetZoom();
    }
    return true;
  };

  // Set up wheel event handler
  useEffect(() => {
    const imageElement = imageRef.current;
    if (imageElement && zoomModeEnabled) {
      imageElement.addEventListener('wheel', handleZoomWheel, { passive: false });
    }
    
    return () => {
      if (imageElement) {
        imageElement.removeEventListener('wheel', handleZoomWheel);
      }
    };
  }, [zoomModeEnabled, isImageExpanded, zoomLevel, position]);

  // Reset zoom when changing images
  const resetZoomOnImageChange = () => {
    resetZoom();
  };

  return {
    zoomLevel,
    position,
    zoomModeEnabled,
    imageRef,
    toggleZoomMode,
    handleMouseMove,
    handleImageClick,
    resetZoomOnImageChange
  };
};
