import { useState, useEffect } from "react";
import { WorkOrderListProps } from "./types";
import { StatusFilterCards } from "./filters/StatusFilterCards";
import { DebugDataDisplay } from "./debug/DebugDataDisplay";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ImageViewModal } from "./modal/ImageViewModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { SortDirection, SortField } from "./types";

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
  onResolveFlag,
  cachedWorkOrder,
  clearCachedWorkOrder,
  isImageModalOpen,
  selectedWorkOrderId,
  onCloseImageModal
}: WorkOrderListProps) => {
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  
  const [localSelectedWorkOrder, setLocalSelectedWorkOrder] = useState<string | null>(null);
  const [localIsImageModalOpen, setLocalIsImageModalOpen] = useState(false);
  
  const isMobile = useIsMobile();

  useEffect(() => {
    if (selectedWorkOrderId !== undefined) {
      setLocalSelectedWorkOrder(selectedWorkOrderId);
    }
  }, [selectedWorkOrderId]);
  
  useEffect(() => {
    if (isImageModalOpen !== undefined) {
      setLocalIsImageModalOpen(isImageModalOpen);
    }
  }, [isImageModalOpen]);

  const effectiveSelectedWorkOrderId = selectedWorkOrderId !== undefined ? selectedWorkOrderId : localSelectedWorkOrder;
  const effectiveIsImageModalOpen = isImageModalOpen !== undefined ? isImageModalOpen : localIsImageModalOpen;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  let currentWorkOrder = workOrders.find(wo => wo.id === effectiveSelectedWorkOrderId);
  
  if (!currentWorkOrder && cachedWorkOrder && cachedWorkOrder.id === effectiveSelectedWorkOrderId) {
    currentWorkOrder = cachedWorkOrder;
  }
  
  const currentIndex = currentWorkOrder ? 
    workOrders.findIndex(wo => wo.id === currentWorkOrder?.id) : 
    -1;

  const handleImageView = (workOrderId: string) => {
    if (selectedWorkOrderId === undefined) {
      setLocalSelectedWorkOrder(workOrderId);
      setLocalIsImageModalOpen(true);
    }
    if (onImageView) onImageView(workOrderId);
  };

  const handleNavigate = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      const newWorkOrderId = workOrders[index].id;
      
      if (selectedWorkOrderId === undefined) {
        setLocalSelectedWorkOrder(newWorkOrderId);
      } else {
        onImageView(newWorkOrderId);
      }
      
      if (clearCachedWorkOrder) {
        clearCachedWorkOrder();
      }
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
          const newWorkOrderId = workOrders[0].id;
          
          if (selectedWorkOrderId === undefined) {
            setLocalSelectedWorkOrder(newWorkOrderId);
          } else {
            onImageView(newWorkOrderId);
          }
          
          if (clearCachedWorkOrder) {
            clearCachedWorkOrder();
          }
        }
      }, 100);
    } else if (direction === 'previous' && pagination.page > 1) {
      onPageChange(newPage);
      
      setTimeout(() => {
        if (workOrders.length > 0) {
          const newWorkOrderId = workOrders[workOrders.length - 1].id;
          
          if (selectedWorkOrderId === undefined) {
            setLocalSelectedWorkOrder(newWorkOrderId);
          } else {
            onImageView(newWorkOrderId);
          }
          
          if (clearCachedWorkOrder) {
            clearCachedWorkOrder();
          }
        }
      }, 100);
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

  const handleModalClose = () => {
    if (onCloseImageModal !== undefined) {
      onCloseImageModal();
    } else {
      setLocalIsImageModalOpen(false);
      setTimeout(() => {
        setLocalSelectedWorkOrder(null);
        if (clearCachedWorkOrder) {
          clearCachedWorkOrder();
        }
      }, 300);
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
        onStatusUpdate={onStatusUpdate}
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

      {currentWorkOrder && (
        <ImageViewModal
          workOrder={currentWorkOrder}
          workOrders={workOrders}
          currentIndex={currentIndex}
          isOpen={effectiveIsImageModalOpen}
          onClose={handleModalClose}
          onStatusUpdate={onStatusUpdate}
          onNavigate={handleNavigate}
          onPageBoundary={handlePageBoundary}
          onResolveFlag={onResolveFlag}
          onDownloadAll={() => {
            console.log("Download all images for:", currentWorkOrder.id);
          }}
        />
      )}
    </div>
  );
};
