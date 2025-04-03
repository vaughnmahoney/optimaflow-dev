
import { useState } from "react";
import { WorkOrderListProps } from "./types";
import { StatusFilterCards } from "./filters/StatusFilterCards";
import { DebugDataDisplay } from "./debug/DebugDataDisplay";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ImageViewModal } from "./modal/ImageViewModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { SortDirection, SortField } from "./types";
import { useQueryClient } from "@tanstack/react-query";

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
  refetch,
  isRefreshing
}: WorkOrderListProps) => {
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const currentWorkOrder = workOrders.find(wo => wo.id === selectedWorkOrder) || null;
  const currentIndex = currentWorkOrder ? workOrders.findIndex(wo => wo.id === currentWorkOrder.id) : -1;

  const handleImageView = (workOrderId: string) => {
    setSelectedWorkOrder(workOrderId);
    setIsImageModalOpen(true);
    if (onImageView) onImageView(workOrderId);
  };

  const handleNavigate = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      setSelectedWorkOrder(workOrders[index].id);
    }
  };

  const handleAdvanceToNextOrder = (nextOrderId: string) => {
    setSelectedWorkOrder(nextOrderId);
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
          setSelectedWorkOrder(workOrders[0].id);
        }
      }, 100);
    } else if (direction === 'previous' && pagination.page > 1) {
      onPageChange(newPage);
      setTimeout(() => {
        if (workOrders.length > 0) {
          setSelectedWorkOrder(workOrders[workOrders.length - 1].id);
        }
      }, 100);
    }
  };

  const handleStatusFilterChange = (status: string | null) => {
    // When filter changes, refresh the data to show accurate statuses
    queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    
    onFiltersChange({
      ...filters,
      status
    });
  };

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    if (onSort) {
      // Refresh data when sort changes
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      onSort(field, direction);
    }
  };

  const handleStatusUpdate = (workOrderId: string, newStatus: string, options?: any) => {
    const updatedOptions = {
      ...options,
      skipRefresh: true,
      updateLocal: true
    };
    
    if (onStatusUpdate) {
      onStatusUpdate(workOrderId, newStatus, updatedOptions);
    }
  };

  const handleResolveFlag = (workOrderId: string, resolution: string, options?: any) => {
    const updatedOptions = {
      ...options,
      skipRefresh: true,
      updateLocal: true
    };
    
    if (onResolveFlag) {
      onResolveFlag(workOrderId, resolution, updatedOptions);
    }
  };

  const handleRefresh = () => {
    if (refetch) {
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
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
      </div>

      <DebugDataDisplay 
        searchResponse={searchResponse}
        transformedData={transformedData}
      />

      {/* Top pagination indicator with refresh button */}
      {pagination && onPageChange && (
        <PaginationIndicator 
          pagination={pagination}
          onPageChange={onPageChange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      )}

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

      {currentWorkOrder && (
        <ImageViewModal
          workOrder={currentWorkOrder}
          workOrders={workOrders}
          currentIndex={currentIndex}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onStatusUpdate={handleStatusUpdate}
          onNavigate={handleNavigate}
          onPageBoundary={handlePageBoundary}
          onResolveFlag={handleResolveFlag}
          filters={filters}
          onDownloadAll={() => {
            console.log("Download all images for:", currentWorkOrder.id);
          }}
        />
      )}
    </div>
  );
};
