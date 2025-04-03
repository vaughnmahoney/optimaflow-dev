
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
  // Updated modal props
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
  
  // Get the current index for navigation within the current filtered list
  const currentIndex = activeWorkOrder 
    ? workOrders.findIndex(wo => wo.id === activeWorkOrder.id) 
    : -1;
  
  // Handle navigation between work orders in the modal
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

      {/* Image View Modal - Using activeWorkOrder directly */}
      {isImageModalOpen && activeWorkOrder && (
        <ImageViewModal
          workOrder={activeWorkOrder}
          workOrders={workOrders} 
          currentIndex={currentIndex}
          isOpen={isImageModalOpen}
          onClose={onCloseImageModal}
          onStatusUpdate={onStatusUpdate}
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
