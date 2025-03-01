import { useState, useRef, useEffect } from "react";

interface ZoomState {
  zoomLevel: number;
  position: { x: number; y: number };
  zoomModeEnabled: boolean;
  lastMousePosition: { x: number; y: number };
  isDragging: boolean;
}

interface UseImageZoomProps {
  isImageExpanded: boolean;
}

export const useImageZoom = ({ isImageExpanded }: UseImageZoomProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoomModeEnabled, setZoomModeEnabled] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
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
    
    if (isDragging && zoomLevel > 1) {
      // Calculate the movement delta
      const deltaX = e.clientX - lastMousePosition.x;
      const deltaY = e.clientY - lastMousePosition.y;
      
      // Update position based on the drag movement
      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY
      });
    }
    
    // Store the current mouse position
    setLastMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!zoomModeEnabled || !isImageExpanded || zoomLevel <= 1) return;
    
    setIsDragging(true);
    setLastMousePosition({
      x: e.clientX,
      y: e.clientY
    });
    
    // Prevent default browser drag behavior
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleZoomWheel = (e: WheelEvent) => {
    if (!zoomModeEnabled || !isImageExpanded) return;
    
    e.preventDefault();
    
    const imageRect = imageRef.current?.getBoundingClientRect();
    if (!imageRect) return;
    
    // Calculate where the cursor is within the image
    const mouseX = e.clientX - imageRect.left;
    const mouseY = e.clientY - imageRect.top;
    
    // Determine zoom change direction and amount
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    const newZoomLevel = Math.max(1, Math.min(10, zoomLevel + delta));
    
    // If zooming out completely, reset position
    if (newZoomLevel === 1) {
      resetZoom();
      return;
    }
    
    // Calculate how the position should change to keep the cursor point stable
    const scaleChange = newZoomLevel / zoomLevel;
    const newPosition = {
      x: mouseX - (mouseX - position.x) * scaleChange,
      y: mouseY - (mouseY - position.y) * scaleChange,
    };
    
    // Update state
    setZoomLevel(newZoomLevel);
    setPosition(newPosition);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isImageExpanded) return false;
    
    // Only handle zoom if zoom mode is enabled
    if (!zoomModeEnabled) return false;
    
    // Don't zoom on click if already dragging
    if (isDragging) {
      return true;
    }
    
    if (zoomLevel === 1) {
      const imageRect = imageRef.current?.getBoundingClientRect();
      if (!imageRect) return true;
      
      // Get click position relative to image
      const mouseX = e.clientX - imageRect.left;
      const mouseY = e.clientY - imageRect.top;
      
      // Zoom in centered on the click position
      setZoomLevel(2);
      
      // Calculate position to keep the clicked point centered
      setPosition({
        x: mouseX - imageRect.width / 2,
        y: mouseY - imageRect.height / 2
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

  // Set up global mouse event handlers for dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Reset zoom when changing images
  const resetZoomOnImageChange = () => {
    resetZoom();
  };

  return {
    zoomLevel,
    position,
    zoomModeEnabled,
    isDragging,
    imageRef,
    toggleZoomMode,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleImageClick,
    resetZoomOnImageChange
  };
};
