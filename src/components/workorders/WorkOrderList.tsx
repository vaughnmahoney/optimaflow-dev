import { useState, useRef, useEffect } from "react";
import { WorkOrderListProps } from "./types";
import { StatusFilterCards } from "./filters/StatusFilterCards";
import { DebugDataDisplay } from "./debug/DebugDataDisplay";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ImageViewModal } from "./modal/ImageViewModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { SortDirection, SortField, WorkOrder } from "./types";

export const WorkOrderList = ({ 
  workOrders, 
  isLoading,
  filters,
  onFiltersChange,
  onStatusUpdate,
  onImageView,
  onDelete,
  onSearchChange,
  onOptimoRouteSearch,
  statusCounts,
  sortField,
  sortDirection,
  onSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  onColumnFilterChange,
  clearColumnFilter,
  clearAllFilters,
  onResolveFlag
}: WorkOrderListProps) => {
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [activeWorkOrder, setActiveWorkOrder] = useState<WorkOrder | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const isUpdatingStatus = useRef(false);

  useEffect(() => {
    if (selectedWorkOrderId) {
      const workOrder = workOrders.find(wo => wo.id === selectedWorkOrderId);
      if (workOrder) {
        setActiveWorkOrder(workOrder);
      }
    } else {
      setActiveWorkOrder(null);
    }
  }, [selectedWorkOrderId, workOrders]);

  const currentIndex = activeWorkOrder 
    ? workOrders.findIndex(wo => wo.id === activeWorkOrder.id) 
    : -1;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const handleImageView = (workOrderId: string) => {
    console.log("Opening image view for:", workOrderId);
    setSelectedWorkOrderId(workOrderId);
    setIsImageModalOpen(true);
    if (onImageView) onImageView(workOrderId);
  };

  const handleNavigate = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      const workOrderId = workOrders[index].id;
      setSelectedWorkOrderId(workOrderId);
    }
  };

  const handlePageBoundary = (direction: 'next' | 'previous') => {
    if (!pagination || !onPageChange) return;
    
    const newPage = direction === 'next' 
      ? pagination.page + 1 
      : Math.max(1, pagination.page - 1);
    
    if (direction === 'next' && pagination.page < Math.ceil(pagination.total / pagination.pageSize)) {
      onPageChange(newPage);
      
      setTimeout(() => {
        if (workOrders.length > 0) {
          setSelectedWorkOrderId(workOrders[0].id);
        }
      }, 100);
    } else if (direction === 'previous' && pagination.page > 1) {
      onPageChange(newPage);
      
      setTimeout(() => {
        if (workOrders.length > 0) {
          setSelectedWorkOrderId(workOrders[workOrders.length - 1].id);
        }
      }, 100);
    }
  };

  const handleStatusUpdate = (workOrderId: string, newStatus: string) => {
    console.log("WorkOrderList: Updating status", workOrderId, newStatus);
    isUpdatingStatus.current = true;

    if (onStatusUpdate) {
      onStatusUpdate(workOrderId, newStatus);
    }

    if (activeWorkOrder && activeWorkOrder.id === workOrderId) {
      setActiveWorkOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }

    setTimeout(() => {
      isUpdatingStatus.current = false;
    }, 500);
  };

  const handleCloseModal = () => {
    if (!isUpdatingStatus.current) {
      setIsImageModalOpen(false);
    }
  };

  const handleStatusFilterChange = (status: string | null) => {
    onFiltersChange({
      ...filters,
      status
    });
  };

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    if (onSort) {
      onSort(field, direction);
    }
  };

  return (
    <div className="space-y-4">
      <StatusFilterCards 
        statusFilter={filters.status}
        onStatusFilterChange={handleStatusFilterChange}
        statusCounts={{
          approved: statusCounts.approved,
          pending_review: statusCounts.pending_review,
          flagged: statusCounts.flagged,
          resolved: statusCounts.resolved,
          rejected: statusCounts.rejected || 0,
          all: statusCounts.all
        }}
        filters={filters}
        onColumnFilterChange={onColumnFilterChange}
        clearColumnFilter={clearColumnFilter}
        clearAllFilters={clearAllFilters}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSortChange}
      />

      <DebugDataDisplay 
        searchResponse={searchResponse}
        transformedData={transformedData}
      />

      <WorkOrderTable 
        workOrders={workOrders}
        onStatusUpdate={handleStatusUpdate}
        onImageView={handleImageView}
        onDelete={onDelete}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
        pagination={pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        filters={filters}
        onColumnFilterChange={onColumnFilterChange}
        onColumnFilterClear={clearColumnFilter}
        onClearAllFilters={clearAllFilters}
      />

      {activeWorkOrder && isImageModalOpen && (
        <ImageViewModal
          workOrder={activeWorkOrder}
          workOrders={workOrders}
          currentIndex={currentIndex}
          isOpen={isImageModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          onNavigate={handleNavigate}
          onPageBoundary={handlePageBoundary}
          onResolveFlag={onResolveFlag}
          onDownloadAll={() => {
            console.log("Download all images for:", activeWorkOrder.id);
          }}
        />
      )}
    </div>
  );
};
