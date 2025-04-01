
import { useState, useEffect } from "react";
import { WorkOrder } from "@/components/workorders/types";

interface UseWorkOrderNavigationProps {
  workOrders: WorkOrder[];
  initialWorkOrderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPageBoundary?: (direction: 'next' | 'previous') => void;
  onPageChange?: () => void; // Add callback for when page changes
}

export const useWorkOrderNavigation = ({
  workOrders,
  initialWorkOrderId,
  isOpen,
  onClose,
  onPageBoundary,
  onPageChange
}: UseWorkOrderNavigationProps) => {
  const [currentWorkOrderId, setCurrentWorkOrderId] = useState<string | null>(initialWorkOrderId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isNavigatingPages, setIsNavigatingPages] = useState(false);
  
  // Reset state when modal opens/closes or initial work order changes
  useEffect(() => {
    if (isOpen && initialWorkOrderId) {
      setCurrentWorkOrderId(initialWorkOrderId);
      setCurrentImageIndex(0);
      setIsNavigatingPages(false);
    }
  }, [isOpen, initialWorkOrderId]);

  // Handle workOrders changes (which happens when page changes)
  useEffect(() => {
    if (isNavigatingPages && workOrders.length > 0) {
      // If we were navigating pages and new work orders arrived
      // Select first or last work order based on stored direction
      const navigatingDirection = localStorage.getItem('navigatingDirection');
      
      if (navigatingDirection === 'next') {
        setCurrentWorkOrderId(workOrders[0].id);
      } else if (navigatingDirection === 'previous') {
        setCurrentWorkOrderId(workOrders[workOrders.length - 1].id);
      }
      
      setIsNavigatingPages(false);
      localStorage.removeItem('navigatingDirection');
      
      // Notify parent that page has changed and new selection is made
      if (onPageChange) {
        onPageChange();
      }
    }
  }, [workOrders, isNavigatingPages, onPageChange]);
  
  // Get the current work order and its index
  const currentWorkOrder = workOrders.find(wo => wo.id === currentWorkOrderId) || null;
  const currentIndex = currentWorkOrder ? workOrders.findIndex(wo => wo.id === currentWorkOrder.id) : -1;
  
  // Reset image index when work order changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentWorkOrderId]);
  
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case "ArrowLeft":
          if (e.altKey) {
            handlePreviousOrder();
          } else {
            handlePreviousImage();
          }
          break;
        case "ArrowRight":
          if (e.altKey) {
            handleNextOrder();
          } else {
            handleNextImage();
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentImageIndex, currentIndex, currentWorkOrderId]);
  
  const handlePreviousOrder = () => {
    if (currentIndex > 0) {
      setCurrentWorkOrderId(workOrders[currentIndex - 1].id);
      setCurrentImageIndex(0);
    } else if (onPageBoundary && currentIndex === 0) {
      // We're at the first order of the current page
      setIsNavigatingPages(true);
      localStorage.setItem('navigatingDirection', 'previous');
      onPageBoundary('previous');
    }
  };

  const handleNextOrder = () => {
    if (currentIndex < workOrders.length - 1) {
      setCurrentWorkOrderId(workOrders[currentIndex + 1].id);
      setCurrentImageIndex(0);
    } else if (onPageBoundary && currentIndex === workOrders.length - 1) {
      // We're at the last order of the current page
      setIsNavigatingPages(true);
      localStorage.setItem('navigatingDirection', 'next');
      onPageBoundary('next');
    }
  };

  const handleSetOrder = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      setCurrentWorkOrderId(workOrders[index].id);
      setCurrentImageIndex(0);
    }
  };
  
  const handlePreviousImage = () => {
    if (!currentWorkOrder) return;
    
    const images = currentWorkOrder?.completion_response?.orders?.[0]?.data?.form?.images || [];
    
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(images.length - 1);
    }
  };
  
  const handleNextImage = () => {
    if (!currentWorkOrder) return;
    
    const images = currentWorkOrder?.completion_response?.orders?.[0]?.data?.form?.images || [];
    
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else if (images.length > 0) {
      setCurrentImageIndex(0);
    }
  };

  return {
    currentWorkOrder,
    currentIndex,
    currentImageIndex,
    isNavigatingPages,
    setCurrentImageIndex,
    setIsNavigatingPages,
    handlePreviousOrder,
    handleNextOrder,
    handleSetOrder,
    handlePreviousImage,
    handleNextImage
  };
};
