
import { useState } from "react";
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
  // New props
  selectedWorkOrderId,
  isImageModalOpen,
  activeWorkOrder,
  onCloseImageModal
}: WorkOrderListProps) => {
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  const isMobile = useIsMobile();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Use the currently filtered work orders or the active work order for the modal
  const currentWorkOrder = activeWorkOrder || workOrders.find(wo => wo.id === selectedWorkOrderId) || null;
  
  // Get the current work order index in the filtered list (for navigation)
  const currentIndex = currentWorkOrder ? workOrders.findIndex(wo => wo.id === currentWorkOrder.id) : -1;

  // Handle status filter change
  const handleStatusFilterChange = (status: string | null) => {
    onFiltersChange({
      ...filters,
      status
    });
  };

  // Handle sort change
  const handleSortChange = (field: SortField, direction: SortDirection) => {
    if (onSort) {
      onSort(field, direction);
    }
  };
  
  // Navigate between work orders in the modal
  const handleNavigate = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      const navigatedWorkOrder = workOrders[index];
      onImageView(navigatedWorkOrder.id);
    }
  };
  
  // Handle navigation between pages from the modal
  const handlePageBoundary = (direction: 'next' | 'previous') => {
    if (!pagination || !onPageChange) return;
    
    const newPage = direction === 'next' 
      ? pagination.page + 1 
      : Math.max(1, pagination.page - 1);
    
    // Only navigate if we have more pages
    if (direction === 'next' && pagination.page < Math.ceil(pagination.total / pagination.pageSize)) {
      onPageChange(newPage);
      
      // We use setTimeout to ensure this runs after the new data is loaded
      setTimeout(() => {
        if (workOrders.length > 0) {
          // Select the first order when going to the next page
          onImageView(workOrders[0].id);
        }
      }, 100);
    } else if (direction === 'previous' && pagination.page > 1) {
      onPageChange(newPage);
      
      // We use setTimeout to ensure this runs after the new data is loaded
      setTimeout(() => {
        if (workOrders.length > 0) {
          // Select the last order when going to the previous page
          onImageView(workOrders[workOrders.length - 1].id);
        }
      }, 100);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status filter cards with integrated filter button */}
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
        onImageView={onImageView}
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

      {/* Image View Modal - Now using the activeWorkOrder or currentWorkOrder */}
      {currentWorkOrder && (
        <ImageViewModal
          workOrder={currentWorkOrder}
          workOrders={workOrders}
          currentIndex={currentIndex}
          isOpen={isImageModalOpen === true}
          onClose={onCloseImageModal || (() => {})}
          onStatusUpdate={onStatusUpdate}
          onNavigate={handleNavigate}
          onPageBoundary={handlePageBoundary}
          onResolveFlag={onResolveFlag}
          onDownloadAll={() => {
            // Placeholder for download all functionality
            console.log("Download all images for:", currentWorkOrder.id);
          }}
        />
      )}
    </div>
  );
};
