import { useState, useEffect } from "react";
import { WorkOrder } from "@/components/workorders/types";

interface UseWorkOrderNavigationProps {
  workOrders: WorkOrder[];
  initialWorkOrderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPageBoundary?: (direction: 'next' | 'previous') => void;
  isNavigatingPages?: boolean;
}

export const useWorkOrderNavigation = ({
  workOrders,
  initialWorkOrderId,
  isOpen,
  onClose,
  onPageBoundary,
  isNavigatingPages: initialIsNavigatingPages = false
}: UseWorkOrderNavigationProps) => {
  const [currentWorkOrderId, setCurrentWorkOrderId] = useState<string | null>(initialWorkOrderId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isNavigatingPages, setIsNavigatingPages] = useState(initialIsNavigatingPages);

  // Find the current work order in the array
  const currentWorkOrder = workOrders.find(wo => wo.id === currentWorkOrderId) || null;
  
  // Find the index of the current work order in the array
  const currentIndex = currentWorkOrder ? workOrders.findIndex(wo => wo.id === currentWorkOrder.id) : -1;

  // When the initialWorkOrderId changes, update our internal state
  useEffect(() => {
    if (initialWorkOrderId !== currentWorkOrderId) {
      setCurrentWorkOrderId(initialWorkOrderId);
      setCurrentImageIndex(0); // Reset image index when switching work orders
    }
  }, [initialWorkOrderId, currentWorkOrderId]);

  // When modal closes, reset navigation state
  useEffect(() => {
    if (!isOpen) {
      setIsNavigatingPages(false);
    }
  }, [isOpen]);

  // Function to handle setting the order directly by index
  const handleSetOrder = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      const newWorkOrderId = workOrders[index].id;
      setCurrentWorkOrderId(newWorkOrderId);
      setCurrentImageIndex(0); // Reset image index when changing orders
    }
  };

  // Function to handle navigation to the previous order
  const handlePreviousOrder = () => {
    // If at the first work order and pagination boundary handler exists
    if (currentIndex === 0 && onPageBoundary) {
      setIsNavigatingPages(true);
      onPageBoundary('previous');
    } 
    // Otherwise navigate within the current page
    else if (currentIndex > 0) {
      handleSetOrder(currentIndex - 1);
    }
  };

  // Function to handle navigation to the next order
  const handleNextOrder = () => {
    // If at the last work order and pagination boundary handler exists
    if (currentIndex === workOrders.length - 1 && onPageBoundary) {
      setIsNavigatingPages(true);
      onPageBoundary('next');
    } 
    // Otherwise navigate within the current page
    else if (currentIndex < workOrders.length - 1) {
      handleSetOrder(currentIndex + 1);
    }
  };

  // Function to handle navigation to the next image
  const handleNextImage = () => {
    const completionData = currentWorkOrder?.completion_response?.orders?.[0]?.data;
    const images = completionData?.form?.images || [];
    
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      handleNextOrder();
    }
  };

  // Function to handle navigation to the previous image
  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      handlePreviousOrder();
    }
  };

  return {
    currentWorkOrder,
    currentIndex,
    currentImageIndex,
    isNavigatingPages,
    setCurrentImageIndex,
    setIsNavigatingPages,
    handleSetOrder,
    handlePreviousOrder,
    handleNextOrder,
    handlePreviousImage,
    handleNextImage
  };
};
