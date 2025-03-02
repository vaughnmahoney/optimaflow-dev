import { useState, useEffect } from "react";
import { WorkOrder } from "@/components/workorders/types";

interface UseWorkOrderNavigationProps {
  workOrders: WorkOrder[];
  initialWorkOrderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const useWorkOrderNavigation = ({
  workOrders,
  initialWorkOrderId,
  isOpen,
  onClose
}: UseWorkOrderNavigationProps) => {
  const [currentWorkOrderId, setCurrentWorkOrderId] = useState<string | null>(initialWorkOrderId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && initialWorkOrderId) {
      setCurrentWorkOrderId(initialWorkOrderId);
      setCurrentImageIndex(0);
    }
  }, [isOpen, initialWorkOrderId]);
  
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
    }
  };

  const handleNextOrder = () => {
    if (currentIndex < workOrders.length - 1) {
      setCurrentWorkOrderId(workOrders[currentIndex + 1].id);
      setCurrentImageIndex(0);
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
    setCurrentImageIndex,
    handlePreviousOrder,
    handleNextOrder,
    handleSetOrder,
    handlePreviousImage,
    handleNextImage
  };
};
