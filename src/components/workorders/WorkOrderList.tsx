
import { useState } from "react";
import { WorkOrderListProps } from "./types";
import { StatusFilterCards } from "./filters/StatusFilterCards";
import { DebugDataDisplay } from "./debug/DebugDataDisplay";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ImageViewModal } from "./modal/ImageViewModal";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  onPageSizeChange
}: WorkOrderListProps) => {
  const [transformedData, setTransformedData] = useState<any>(null);
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.searchQuery || "");

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
    // Also call the passed onImageView function if needed
    if (onImageView) onImageView(workOrderId);
  };

  // Handle navigation between work orders in the modal
  const handleNavigate = (index: number) => {
    if (index >= 0 && index < workOrders.length) {
      setSelectedWorkOrder(workOrders[index].id);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string | null) => {
    onFiltersChange({
      ...filters,
      status
    });
  };

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  // Apply search filter when user stops typing
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchChange(searchValue);
    }
  };

  // Debounced search
  const handleSearchBlur = () => {
    if (searchValue !== filters.searchQuery) {
      onSearchChange(searchValue);
    }
  };

  return (
    <div className="space-y-4">
      <StatusFilterCards 
        statusFilter={filters.status}
        onStatusFilterChange={handleStatusFilterChange}
        statusCounts={statusCounts}
      />

      {/* Global Search Bar */}
      <div className="relative w-full max-w-2xl mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        <Input
          type="text"
          placeholder="Search anything (order #, driver, location, date...)..."
          value={searchValue}
          onChange={handleSearchInputChange}
          onKeyDown={handleSearchKeyDown}
          onBlur={handleSearchBlur}
          className="pl-10 w-full h-12 text-base bg-white shadow-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
        />
      </div>

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
        />
      )}
    </div>
  );
};
