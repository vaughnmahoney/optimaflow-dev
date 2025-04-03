
import { useState, useRef, useEffect } from 'react';
import { WorkOrder } from '@/components/workorders/types';

interface UseLocalWorkOrderStateProps {
  initialWorkOrder: WorkOrder | null;
  onStatusUpdate?: (workOrderId: string, status: string, options?: any) => void;
  onResolveFlag?: (workOrderId: string, resolution: string, options?: any) => void;
  onClose?: () => void;
}

export const useLocalWorkOrderState = ({
  initialWorkOrder,
  onStatusUpdate,
  onResolveFlag,
  onClose
}: UseLocalWorkOrderStateProps) => {
  // Local copy of the work order that won't be affected by parent list changes
  const [localWorkOrder, setLocalWorkOrder] = useState<WorkOrder | null>(initialWorkOrder);
  
  // Track if the work order has been modified and needs committing on navigation/close
  const hasLocalChanges = useRef(false);
  
  // Update local state when initialWorkOrder changes (only if no local changes)
  useEffect(() => {
    if (initialWorkOrder && (!localWorkOrder || !hasLocalChanges.current)) {
      setLocalWorkOrder(initialWorkOrder);
    }
  }, [initialWorkOrder, localWorkOrder]);

  // Handle status updates locally first, then queue the actual update
  const handleStatusUpdate = (workOrderId: string, newStatus: string) => {
    if (!localWorkOrder) return;
    
    // Update local state immediately for responsive UI
    setLocalWorkOrder(prev => prev ? {
      ...prev,
      status: newStatus
    } : null);
    
    // Mark that we have pending changes
    hasLocalChanges.current = true;
    
    // Also update the backend without waiting for refresh
    if (onStatusUpdate) {
      // Pass minimal options to avoid immediate filter refresh
      onStatusUpdate(workOrderId, newStatus, { skipRefresh: true });
    }
  };
  
  // Handle flag resolution locally first
  const handleResolveFlag = (workOrderId: string, resolution: string) => {
    if (!localWorkOrder) return;
    
    // Update local state immediately
    const newStatus = resolution === "followup" ? "flagged_followup" : resolution;
    setLocalWorkOrder(prev => prev ? {
      ...prev,
      status: newStatus
    } : null);
    
    // Mark that we have pending changes
    hasLocalChanges.current = true;
    
    // Also update the backend without waiting for refresh
    if (onResolveFlag) {
      // Pass minimal options to avoid immediate filter refresh
      onResolveFlag(workOrderId, resolution, { skipRefresh: true });
    }
  };
  
  // When closing, commit any pending changes to the parent list
  const handleClose = () => {
    // Clear the local changes flag
    hasLocalChanges.current = false;
    
    // Notify parent component to refresh filtered list if needed
    if (onClose) {
      onClose();
    }
  };
  
  return {
    localWorkOrder,
    handleStatusUpdate,
    handleResolveFlag,
    handleClose,
    hasLocalChanges
  };
};
