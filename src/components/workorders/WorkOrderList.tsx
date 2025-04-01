
import { useState, useEffect, useRef } from "react";
import { WorkOrderListProps } from "./types";
import { StatusFilterCards } from "./filters/StatusFilterCards";
import { DebugDataDisplay } from "./debug/DebugDataDisplay";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ImageViewModal } from "./modal/ImageViewModal";

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
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [pageChangeInProgress, setPageChangeInProgress] = useState(false);
  const modalStateRef = useRef({ isOpen: false, workOrderId: null as string | null });

  // When workOrders change and we're in the middle of a page change,
  // we need to update the selected work order
  useEffect(() => {
    // Only run this if page change is in progress
    if (pageChangeInProgress && workOrders.length > 0) {
      // Get the direction we were going from localStorage
      const navigatingDirection = localStorage.getItem('navigatingDirection');
      
      // Pick the first or last work order based on direction
      if (navigatingDirection === 'next' && workOrders.length > 0) {
        setSelectedWorkOrder(workOrders[0].id);
      } else if (navigatingDirection === 'previous' && workOrders.length > 0) {
        setSelectedWorkOrder(workOrders[workOrders.length - 1].id);
      }
      
      // Reset page change flag and clean up localStorage
      setPageChangeInProgress(false);
      localStorage.removeItem('navigatingDirection');
      
      // Ensure modal stays open with the newly selected work order
      if (modalStateRef.current.isOpen) {
        setIsImageModalOpen(true);
      }
    }
  }, [workOrders, pageChangeInProgress]);

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
    modalStateRef.current = { isOpen: true, workOrderId };
    
    // Also call the passed onImageView function if needed
    if (onImageView) onImageView(workOrderId);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsImageModalOpen(false);
    modalStateRef.current = { isOpen: false, workOrderId: null };
  };

  // Handle navigation between work orders in the modal
  const handleNavigate = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      setSelectedWorkOrder(workOrders[index].id);
      modalStateRef.current.workOrderId = workOrders[index].id;
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
      // Store the direction for when the new page loads
      localStorage.setItem('navigatingDirection', 'next');
      setPageChangeInProgress(true);
      
      // Change the page
      onPageChange(newPage);
    } else if (direction === 'previous' && pagination.page > 1) {
      // Store the direction for when the new page loads
      localStorage.setItem('navigatingDirection', 'previous');
      setPageChangeInProgress(true);
      
      // Change the page
      onPageChange(newPage);
    }
  };

  // Callback when a page change is complete
  const handlePageChangeComplete = () => {
    // Make sure the modal stays open
    if (modalStateRef.current.isOpen) {
      setIsImageModalOpen(true);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string | null) => {
    onFiltersChange({
      ...filters,
      status
    });
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
          onClose={handleCloseModal}
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
