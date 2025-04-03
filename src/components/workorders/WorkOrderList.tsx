
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { ImageViewModal } from "./modal/ImageViewModal";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { useWorkOrderNavigation } from "@/hooks/useWorkOrderNavigation";
import { WorkOrder } from "./types/workOrder";

export function WorkOrderList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageViewerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const workOrderData = useWorkOrderData();
  const { updateWorkOrderStatus, resolveWorkOrderFlag } = useWorkOrderMutations();

  const {
    currentWorkOrder,
    currentIndex,
    currentImageIndex,
    setCurrentImageIndex,
    handleNextOrder,
    handlePreviousOrder,
    handleSetOrder
  } = useWorkOrderNavigation({
    workOrders: workOrderData.data || [],
    initialWorkOrderId: selectedWorkOrder?.id || null,
    isOpen: isModalOpen,
    onClose: () => setIsModalOpen(false)
  });

  const hasNextWorkOrder = currentIndex < (workOrderData.data?.length || 0) - 1;
  const hasPreviousWorkOrder = currentIndex > 0;

  const onStatusUpdate = useCallback(
    (workOrderId: string, status: string, closeModal?: boolean) => {
      updateWorkOrderStatus(workOrderId, status);
      if (closeModal) {
        setIsModalOpen(false);
      }
    },
    [updateWorkOrderStatus]
  );

  const onResolveFlag = useCallback(
    (workOrderId: string, notes: string, closeModal?: boolean) => {
      resolveWorkOrderFlag(workOrderId, notes);
      if (closeModal) {
        setIsModalOpen(false);
      }
    },
    [resolveWorkOrderFlag]
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
        onRowClick={handleRowClick}
        onStatusUpdate={handleStatusUpdate}
        pagination={workOrderData.pagination}
        onPageChange={workOrderData.handlePageChange}
        onResolveFlag={handleResolveFlag}
        ref={indicatorRef}
      />
      
      {selectedWorkOrder && (
        <ImageViewModal
          workOrder={selectedWorkOrder}
          workOrders={workOrderData.data || []}
          currentIndex={currentIndex}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onStatusUpdate={onStatusUpdate}
          onResolveFlag={onResolveFlag}
          onNavigate={handleSetOrder}
          onPageBoundary={workOrderData.handlePageChange}
          hasNextWorkOrder={hasNextWorkOrder}
          hasPreviousWorkOrder={hasPreviousWorkOrder}
          onNextWorkOrder={handleNextOrder}
          onPreviousWorkOrder={handlePreviousOrder}
        />
      )}
    </div>
  );
}
