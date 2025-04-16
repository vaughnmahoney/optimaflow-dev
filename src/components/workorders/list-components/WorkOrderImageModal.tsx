
import { useState } from "react";
import { WorkOrder } from "../types";
import { ImageViewModal } from "../modal/ImageViewModal";

interface WorkOrderImageModalProps {
  selectedWorkOrder: string | null;
  workOrders: WorkOrder[];
  onImageView?: (workOrderId: string) => void;
  onStatusUpdate: (workOrderId: string, newStatus: string, options?: any) => void;
  onResolveFlag?: (workOrderId: string, resolution: string, options?: any) => void;
  filters: any;
  onClose: () => void;
  isOpen: boolean;
  onPageBoundary?: (direction: 'next' | 'previous') => void;
}

export const WorkOrderImageModal = ({
  selectedWorkOrder,
  workOrders,
  onImageView,
  onStatusUpdate,
  onResolveFlag,
  filters,
  onClose,
  isOpen,
  onPageBoundary
}: WorkOrderImageModalProps) => {
  const currentWorkOrder = workOrders.find(wo => wo.id === selectedWorkOrder) || null;
  const currentIndex = currentWorkOrder ? workOrders.findIndex(wo => wo.id === currentWorkOrder.id) : -1;

  const handleNavigate = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      if (onImageView) onImageView(workOrders[index].id);
    }
  };

  const handleStatusUpdate = (workOrderId: string, newStatus: string, options?: any) => {
    const updatedOptions = {
      ...options,
      skipRefresh: true,
      updateLocal: true
    };
    
    onStatusUpdate(workOrderId, newStatus, updatedOptions);
  };

  const handleResolveFlag = (workOrderId: string, resolution: string, options?: any) => {
    if (!onResolveFlag) return;
    
    const updatedOptions = {
      ...options,
      skipRefresh: true,
      updateLocal: true
    };
    
    onResolveFlag(workOrderId, resolution, updatedOptions);
  };

  if (!currentWorkOrder && workOrders.length > 0 && isOpen) {
    // When navigating pages and there's no current work order selected yet,
    // select the first one in the new page
    if (onImageView) {
      onImageView(workOrders[0].id);
    }
  }

  if (!currentWorkOrder) return null;

  return (
    <ImageViewModal
      workOrder={currentWorkOrder}
      workOrders={workOrders}
      currentIndex={currentIndex}
      isOpen={isOpen}
      onClose={onClose}
      onStatusUpdate={handleStatusUpdate}
      onNavigate={handleNavigate}
      onPageBoundary={onPageBoundary}
      onResolveFlag={handleResolveFlag}
      filters={filters}
      onDownloadAll={() => {
        console.log("Download all images for:", currentWorkOrder.id);
      }}
    />
  );
};
