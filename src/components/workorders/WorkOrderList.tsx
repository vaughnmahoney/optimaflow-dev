import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { ImageViewModal } from "./modal/ImageViewModal";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { useImageViewer } from "@/hooks/useImageViewer";
import { useWorkOrderNavigation } from "@/hooks/useWorkOrderNavigation";
import { WorkOrder } from "./types/workOrder";

export function WorkOrderList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageViewerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const workOrderData = useWorkOrderData();
  const { updateStatus, resolveFlag, isUpdating } = useWorkOrderMutations();
  const {
    imageViewerState,
    imageViewerActions,
  } = useImageViewer(imageViewerRef, indicatorRef);

  const {
    handleNextWorkOrder,
    handlePrevWorkOrder,
    hasNextWorkOrder,
    hasPrevWorkOrder,
  } = useWorkOrderNavigation(workOrderData.data || [], selectedWorkOrder?.id);

  const onStatusUpdate = useCallback(
    (workOrderId: string, status: string, closeModal?: boolean) => {
      updateStatus(workOrderId, status, closeModal);
    },
    [updateStatus]
  );

  const onResolveFlag = useCallback(
    (workOrderId: string, notes: string, closeModal?: boolean) => {
      resolveFlag(workOrderId, notes, closeModal);
    },
    [resolveFlag]
  );

  // Extract current workorder ID from URL if present
  useEffect(() => {
    const workOrderIdFromUrl = searchParams.get("workOrderId");
    if (workOrderIdFromUrl && workOrderData.data) {
      const workOrder = workOrderData.data.find(wo => wo.id === workOrderIdFromUrl);
      if (workOrder) {
        setSelectedWorkOrder(workOrder);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, workOrderData.data]);

  // Update URL when modal opens/closes
  useEffect(() => {
    if (isModalOpen && selectedWorkOrder) {
      searchParams.set("workOrderId", selectedWorkOrder.id);
      setSearchParams(searchParams);
    } else {
      if (searchParams.has("workOrderId")) {
        searchParams.delete("workOrderId");
        setSearchParams(searchParams);
      }
    }
  }, [isModalOpen, selectedWorkOrder, searchParams, setSearchParams]);

  const handleRowClick = useCallback((workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedWorkOrder(null);
  }, []);

  // Status update handlers that forward to mutations but don't pass the closeModal parameter
  const handleStatusUpdate = (workOrderId: string, status: string) => {
    onStatusUpdate(workOrderId, status);
  };

  const handleResolveFlag = (workOrderId: string, notes: string) => {
    onResolveFlag(workOrderId, notes);
  };

  return (
    <div className="space-y-6">
      <WorkOrderTable
        workOrders={workOrderData.data || []}
        isLoading={workOrderData.isLoading}
        error={workOrderData.error}
        onRowClick={handleRowClick}
        onStatusUpdate={handleStatusUpdate}
        currentPage={workOrderData.currentPage}
        totalPages={workOrderData.totalPages}
        totalCount={workOrderData.totalCount}
        onPageChange={workOrderData.setCurrentPage}
        onResolveFlag={handleResolveFlag}
        ref={indicatorRef}
      />
      
      {selectedWorkOrder && (
        <ImageViewModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          workOrder={selectedWorkOrder}
          onStatusUpdate={onStatusUpdate}
          onResolveFlag={onResolveFlag}
          ref={imageViewerRef}
          onNextWorkOrder={handleNextWorkOrder}
          onPrevWorkOrder={handlePrevWorkOrder}
          hasNextWorkOrder={hasNextWorkOrder}
          hasPrevWorkOrder={hasPrevWorkOrder}
          imageViewerState={imageViewerState}
          imageViewerActions={imageViewerActions}
        />
      )}
    </div>
  );
}
