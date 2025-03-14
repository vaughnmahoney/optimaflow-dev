
import { WorkOrder } from "./types";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { StatusFilterCards } from "./filters/StatusFilterCards";
import { ImageViewModal } from "./modal/ImageViewModal";
import { useState } from "react";

interface WorkOrderContentProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  statusCounts: {
    approved: number;
    pending_review: number;
    flagged: number;
    resolved: number;
    rejected: number;
    all: number;
  };
  onStatusUpdate: (workOrderId: string, newStatus: string) => void;
  onImageView: (workOrderId: string) => void;
  onDelete: (workOrderId: string) => void;
  onOptimoRouteSearch: (orderNumber: string) => Promise<void>;
  onResolveFlag: (workOrderId: string, resolution: string) => Promise<void>;
}

export const WorkOrderContent = ({
  workOrders,
  isLoading,
  statusCounts,
  onStatusUpdate,
  onImageView,
  onDelete,
  onOptimoRouteSearch,
  onResolveFlag
}: WorkOrderContentProps) => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Get the current work order and its index
  const currentWorkOrder = workOrders.find(wo => wo.id === selectedWorkOrder) || null;
  const currentIndex = currentWorkOrder ? workOrders.findIndex(wo => wo.id === currentWorkOrder.id) : -1;

  // Handle the image view click
  const handleImageView = (workOrderId: string) => {
    setSelectedWorkOrder(workOrderId);
    setIsImageModalOpen(true);
    onImageView(workOrderId);
  };

  // Handle navigation between work orders in the modal
  const handleNavigate = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      setSelectedWorkOrder(workOrders[index].id);
    }
  };

  return (
    <div className="space-y-4">
      <StatusFilterCards 
        statusFilter={null}
        onStatusFilterChange={() => {}} // No-op since we're removing filtering
        statusCounts={statusCounts}
      />

      <WorkOrderTable 
        workOrders={workOrders}
        onStatusUpdate={onStatusUpdate}
        onImageView={handleImageView}
        onDelete={onDelete}
      />

      {currentWorkOrder && (
        <ImageViewModal
          workOrder={currentWorkOrder}
          workOrders={workOrders}
          currentIndex={currentIndex}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onStatusUpdate={onStatusUpdate}
          onNavigate={handleNavigate}
          onResolveFlag={onResolveFlag}
          onDownloadAll={() => {
            console.log("Download all images for:", currentWorkOrder.id);
          }}
        />
      )}
    </div>
  );
};
