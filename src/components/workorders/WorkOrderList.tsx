
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
  cachedWorkOrder, // Added cachedWorkOrder prop
  clearCachedWorkOrder // Added clearCachedWorkOrder function
}: WorkOrderListProps) => {
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Get the current work order and its index, now with support for cached work orders
  let currentWorkOrder = workOrders.find(wo => wo.id === selectedWorkOrder);
  
  // If the selected work order is not in the filtered list but we have a cached version, use that
  if (!currentWorkOrder && cachedWorkOrder && cachedWorkOrder.id === selectedWorkOrder) {
    currentWorkOrder = cachedWorkOrder;
  }
  
  // If there's a current work order, find its index in the filtered list
  const currentIndex = currentWorkOrder ? 
    workOrders.findIndex(wo => wo.id === currentWorkOrder?.id) : 
    -1;

  // Handle the image view click
  const handleImageView = (workOrderId: string) => {
    setSelectedWorkOrder(workOrderId);
    setIsImageModalOpen(true);
    // Also call the passed onImageView function if needed
    if (onImageView) onImageView(workOrderId);
  };

  // Handle navigation between work orders in the modal
  const handleNavigate = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      setSelectedWorkOrder(workOrders[index].id);
      // Clear any cached work order when navigating to a new one
      if (clearCachedWorkOrder) {
        clearCachedWorkOrder();
      }
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
          setSelectedWorkOrder(workOrders[0].id);
          // Clear cached work order
          if (clearCachedWorkOrder) {
            clearCachedWorkOrder();
          }
        }
      }, 100);
    } else if (direction === 'previous' && pagination.page > 1) {
      onPageChange(newPage);
      
      // We use setTimeout to ensure this runs after the new data is loaded
      setTimeout(() => {
        if (workOrders.length > 0) {
          // Select the last order when going to the previous page
          setSelectedWorkOrder(workOrders[workOrders.length - 1].id);
          // Clear cached work order
          if (clearCachedWorkOrder) {
            clearCachedWorkOrder();
          }
        }
      }, 100);
    }
  };

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

  // Handle modal close
  const handleModalClose = () => {
    setIsImageModalOpen(false);
    // Clear any cached work order when closing the modal
    if (clearCachedWorkOrder) {
      clearCachedWorkOrder();
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
          onClose={handleModalClose}
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
