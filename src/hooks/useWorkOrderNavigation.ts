
import { useState, useEffect } from 'react';
import { WorkOrder } from '@/components/workorders/types';

interface UseWorkOrderNavigationProps {
  workOrders: WorkOrder[];
  initialWorkOrderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPageBoundary?: (direction: 'next' | 'previous') => void;
  isNavigatingPages?: boolean;
}

export function useWorkOrderNavigation({
  workOrders,
  initialWorkOrderId,
  isOpen,
  onClose,
  onPageBoundary,
  isNavigatingPages = false
}: UseWorkOrderNavigationProps) {
  const [currentWorkOrderId, setCurrentWorkOrderId] = useState<string | null>(initialWorkOrderId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localIsNavigatingPages, setIsNavigatingPages] = useState(isNavigatingPages);
  
  // Find current work order and its index
  const currentIndex = currentWorkOrderId 
    ? workOrders.findIndex(wo => wo.id === currentWorkOrderId) 
    : -1;
  
  const currentWorkOrder = currentIndex !== -1 
    ? workOrders[currentIndex] 
    : null;

  // Reset image index when work order changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentWorkOrderId]);

  // Sync with external work order ID when it changes
  useEffect(() => {
    if (initialWorkOrderId !== currentWorkOrderId && initialWorkOrderId !== null) {
      setCurrentWorkOrderId(initialWorkOrderId);
    }
  }, [initialWorkOrderId, currentWorkOrderId]);

  // Sync with external navigating state
  useEffect(() => {
    if (isNavigatingPages !== localIsNavigatingPages) {
      setIsNavigatingPages(isNavigatingPages);
    }
  }, [isNavigatingPages, localIsNavigatingPages]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen]);

  // Navigate to previous order
  const handlePreviousOrder = () => {
    // On the first order and have page boundary handler?
    if (currentIndex === 0 && onPageBoundary) {
      console.log("At first work order, navigating to previous page");
      setIsNavigatingPages(true); // Enter navigation state
      onPageBoundary('previous');
      return;
    }
    
    // Not on the first order, just move to previous
    if (currentIndex > 0) {
      const prevOrderId = workOrders[currentIndex - 1].id;
      console.log("Moving to previous order:", prevOrderId);
      setCurrentWorkOrderId(prevOrderId);
    }
  };

  // Navigate to next order
  const handleNextOrder = () => {
    // On the last order and have page boundary handler?
    if (currentIndex === workOrders.length - 1 && onPageBoundary) {
      console.log("At last work order, navigating to next page");
      setIsNavigatingPages(true); // Enter navigation state
      onPageBoundary('next');
      return;
    }
    
    // Not on the last order, just move to next
    if (currentIndex < workOrders.length - 1) {
      const nextOrderId = workOrders[currentIndex + 1].id;
      console.log("Moving to next order:", nextOrderId);
      setCurrentWorkOrderId(nextOrderId);
    }
  };

  // Set to specific order by index
  const handleSetOrder = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      setCurrentWorkOrderId(workOrders[index].id);
    }
  };

  return {
    currentWorkOrder,
    currentWorkOrderId,
    currentIndex,
    currentImageIndex,
    isNavigatingPages: localIsNavigatingPages,
    setCurrentWorkOrderId,
    setCurrentImageIndex,
    setIsNavigatingPages,
    handlePreviousOrder,
    handleNextOrder,
    handleSetOrder
  };
}
