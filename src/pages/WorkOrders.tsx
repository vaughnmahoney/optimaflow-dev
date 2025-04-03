
import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { WorkOrderHeader } from "@/components/workorders/WorkOrderHeader";
import { ImportControls } from "@/components/workorders/ImportControls";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useQueryClient } from "@tanstack/react-query";
import { SortDirection, SortField, WorkOrder } from "@/components/workorders/types";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { useIsMobile } from "@/hooks/use-mobile";

const WorkOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { resolveWorkOrderFlag, updateWorkOrderStatus: updateStatus } = useWorkOrderMutations();
  const isMobile = useIsMobile();
  
  // Modal state management at the parent level
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [activeWorkOrder, setActiveWorkOrder] = useState<WorkOrder | null>(null);
  
  const {
    data: workOrders,
    isLoading, 
    filters,
    setFilters,
    onColumnFilterChange,
    clearColumnFilter,
    clearAllFilters,
    searchOptimoRoute,
    updateWorkOrderStatus,
    deleteWorkOrder,
    statusCounts,
    sortField,
    sortDirection,
    setSort,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    refetch
  } = useWorkOrderData();

  useEffect(() => {
    queryClient.prefetchQuery({ 
      queryKey: ["flaggedWorkOrdersCount"]
    });
  }, [queryClient]);

  useEffect(() => {
    if (location.pathname.match(/\/work-orders\/[^/]+$/)) {
      navigate("/work-orders", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSort(field, direction);
  };

  // Function to handle opening the image viewer
  const handleImageView = (workOrderId: string) => {
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    if (workOrder) {
      setSelectedWorkOrderId(workOrderId);
      setActiveWorkOrder(workOrder);
      setIsImageModalOpen(true);
    }
  };

  // Function to handle closing the image viewer
  const handleCloseImageViewer = () => {
    setIsImageModalOpen(false);
  };

  // Enhanced status update function that updates the activeWorkOrder
  const handleStatusUpdate = async (workOrderId: string, newStatus: string) => {
    // Update the status in the database
    await updateWorkOrderStatus(workOrderId, newStatus);
    
    // If this is the active work order, update its status in our local state
    if (activeWorkOrder && activeWorkOrder.id === workOrderId) {
      setActiveWorkOrder({
        ...activeWorkOrder,
        status: newStatus
      });
    }
  };

  // Handle resolving a flagged work order
  const handleResolveFlag = async (workOrderId: string, resolution: string) => {
    await resolveWorkOrderFlag(workOrderId, resolution);
    
    // If this is the active work order, update its status in our local state
    if (activeWorkOrder && activeWorkOrder.id === workOrderId) {
      setActiveWorkOrder({
        ...activeWorkOrder,
        status: resolution === 'approved' ? 'resolved' : 'rejected'
      });
    }
  };

  return (
    <Layout
      title="Work Orders"
      header={
        <WorkOrderHeader />
      }
    >
      <div className="space-y-6 overflow-x-hidden">
        {/* Page title - shown on all devices now */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Work Orders</h1>
          {isMobile && <ImportControls onOptimoRouteSearch={searchOptimoRoute} onRefresh={refetch} />}
        </div>
        
        {/* Import controls - only shown on desktop */}
        {!isMobile && (
          <ImportControls onOptimoRouteSearch={searchOptimoRoute} onRefresh={refetch} />
        )}
        
        <WorkOrderContent 
          workOrders={workOrders}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          onStatusUpdate={handleStatusUpdate}
          onImageView={handleImageView}
          onDelete={deleteWorkOrder}
          onOptimoRouteSearch={searchOptimoRoute}
          statusCounts={statusCounts}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onColumnFilterChange={onColumnFilterChange}
          clearColumnFilter={clearColumnFilter}
          clearAllFilters={clearAllFilters}
          onResolveFlag={handleResolveFlag}
          selectedWorkOrderId={selectedWorkOrderId}
          isImageModalOpen={isImageModalOpen}
          activeWorkOrder={activeWorkOrder}
          onCloseImageModal={handleCloseImageViewer}
        />
      </div>
    </Layout>
  );
};

export default WorkOrders;
