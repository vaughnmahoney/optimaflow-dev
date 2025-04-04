
import { WorkOrderListProps } from "./types";
import { DebugDataDisplay } from "./debug/DebugDataDisplay";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { FiltersSection } from "./list-components/FiltersSection";
import { TopPagination } from "./list-components/TopPagination";
import { WorkOrderImageModal } from "./list-components/WorkOrderImageModal";
import { useWorkOrderListState } from "./hooks/useWorkOrderListState";
import { useEffect } from "react";

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
  const isMobile = useIsMobile();
  
  const {
    searchResponse,
    setSearchResponse,
    transformedData,
    setTransformedData,
    selectedWorkOrder,
    setSelectedWorkOrder,
    isImageModalOpen,
    handleImageView,
    handleCloseImageModal,
    handleSortChange,
    handlePageBoundary,
    isNavigatingPages,
    setIsNavigatingPages
  } = useWorkOrderListState();

  // Effect to select the first work order on new page if navigating pages
  useEffect(() => {
    if (isNavigatingPages && workOrders.length > 0) {
      // Select the first item on the new page
      setTimeout(() => {
        setSelectedWorkOrder(workOrders[0]?.id || null);
        setIsNavigatingPages(false);
      }, 100);
    }
  }, [workOrders, isNavigatingPages, setSelectedWorkOrder, setIsNavigatingPages]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Handle image view, update both local state and inform parent
  const handleImageViewWithCallback = (workOrderId: string) => {
    handleImageView(workOrderId);
    if (onImageView) onImageView(workOrderId);
  };

  // Create the page boundary handler with the current pagination, page change handler, and work orders
  const pageBoundaryHandler = handlePageBoundary(pagination, onPageChange, workOrders);

  return (
    <div className="space-y-4">
      {/* Filters section */}
      <FiltersSection 
        filters={filters}
        onFiltersChange={onFiltersChange}
        statusCounts={statusCounts}
        onColumnFilterChange={onColumnFilterChange}
        clearColumnFilter={clearColumnFilter}
        clearAllFilters={clearAllFilters}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSortChange(onSort)}
      />

      <DebugDataDisplay 
        searchResponse={searchResponse}
        transformedData={transformedData}
      />

      {/* Top pagination indicator with refresh button */}
      <TopPagination 
        pagination={pagination}
        onPageChange={onPageChange}
        onRefresh={refetch}
        isRefreshing={isRefreshing}
      />

      <WorkOrderTable 
        workOrders={workOrders}
        onStatusUpdate={onStatusUpdate}
        onImageView={handleImageViewWithCallback}
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

      {/* Image modal */}
      <WorkOrderImageModal 
        selectedWorkOrder={selectedWorkOrder}
        workOrders={workOrders}
        onImageView={setSelectedWorkOrder}
        onStatusUpdate={onStatusUpdate}
        onResolveFlag={onResolveFlag}
        filters={filters}
        onClose={handleCloseImageModal}
        isOpen={isImageModalOpen}
        onPageBoundary={pageBoundaryHandler}
        isNavigatingPages={isNavigatingPages}
      />
    </div>
  );
};
