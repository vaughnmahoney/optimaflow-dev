
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
import { toast } from "sonner";

const WorkOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { resolveWorkOrderFlag } = useWorkOrderMutations();
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
    } else {
      console.error("Work order not found:", workOrderId);
    }
  };

  // Function to handle closing the image viewer
  const handleCloseImageViewer = () => {
    setIsImageModalOpen(false);
    // We don't clear the active work order immediately to avoid flicker
    // if the user re-opens the modal
    setTimeout(() => {
      if (!isImageModalOpen) {
        setActiveWorkOrder(null);
        setSelectedWorkOrderId(null);
      }
    }, 300);
  };

  // Enhanced status update function that updates the activeWorkOrder
  const handleStatusUpdate = async (workOrderId: string, newStatus: string) => {
    try {
      // First update our local activeWorkOrder state immediately
      // This ensures the UI reflects the change right away
      if (activeWorkOrder && activeWorkOrder.id === workOrderId) {
        // Create a deep copy with the updated status
        const updatedWorkOrder = {
          ...activeWorkOrder,
          status: newStatus,
          // Add timestamp information
          last_action_at: new Date().toISOString()
        };
        setActiveWorkOrder(updatedWorkOrder);
        
        // Show a toast notification for better UX
        toast.success(`Work order status updated to ${newStatus}`);
      }
      
      // Then update the status in the database asynchronously
      await updateWorkOrderStatus(workOrderId, newStatus);
    } catch (error) {
      console.error("Error updating work order status:", error);
      toast.error("Failed to update work order status");
      
      // Rollback the local state if the API call fails
      if (activeWorkOrder && activeWorkOrder.id === workOrderId) {
        // Find the original work order in the list
        const originalWorkOrder = workOrders.find(wo => wo.id === workOrderId);
        if (originalWorkOrder) {
          setActiveWorkOrder(originalWorkOrder);
        }
      }
    }
  };

  // Handle resolving a flagged work order
  const handleResolveFlag = async (workOrderId: string, resolution: string) => {
    try {
      // First update our local activeWorkOrder state immediately
      if (activeWorkOrder && activeWorkOrder.id === workOrderId) {
        // Set the appropriate status based on the resolution
        const newStatus = resolution === 'approved' ? 'resolved' : 'rejected';
        
        // Create a deep copy with the updated status
        const updatedWorkOrder = {
          ...activeWorkOrder,
          status: newStatus,
          // Add timestamp information
          resolved_at: new Date().toISOString()
        };
        setActiveWorkOrder(updatedWorkOrder);
        
        // Show a toast notification for better UX
        toast.success(`Flag resolved as ${resolution}`);
      }
      
      // Then update in the database
      await resolveWorkOrderFlag(workOrderId, resolution);
    } catch (error) {
      console.error("Error resolving flag:", error);
      toast.error("Failed to resolve flag");
      
      // Rollback the local state if the API call fails
      if (activeWorkOrder && activeWorkOrder.id === workOrderId) {
        // Find the original work order in the list
        const originalWorkOrder = workOrders.find(wo => wo.id === workOrderId);
        if (originalWorkOrder) {
          setActiveWorkOrder(originalWorkOrder);
        }
      }
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
