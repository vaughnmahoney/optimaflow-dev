import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { WorkOrderHeader } from "@/components/workorders/WorkOrderHeader";
import { ImportControls } from "@/components/workorders/ImportControls";
import { useEffect, useState, useRef } from "react";
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
  
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [activeWorkOrder, setActiveWorkOrder] = useState<WorkOrder | null>(null);
  const isUpdatingStatus = useRef(false);
  
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

  useEffect(() => {
    console.log("Modal state:", { 
      isOpen: isImageModalOpen, 
      activeWorkOrderId: activeWorkOrder?.id,
      statusUpdating: isUpdatingStatus.current 
    });
  }, [isImageModalOpen, activeWorkOrder]);

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSort(field, direction);
  };

  const handleImageView = (workOrderId: string) => {
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    if (workOrder) {
      setActiveWorkOrder(JSON.parse(JSON.stringify(workOrder)));
      setIsImageModalOpen(true);
    } else {
      console.error("Work order not found:", workOrderId);
    }
  };

  const handleCloseImageViewer = () => {
    if (!isUpdatingStatus.current) {
      setIsImageModalOpen(false);
      setTimeout(() => {
        setActiveWorkOrder(null);
      }, 300);
    }
  };

  const handleStatusUpdate = async (workOrderId: string, newStatus: string) => {
    try {
      isUpdatingStatus.current = true;
      
      if (activeWorkOrder && activeWorkOrder.id === workOrderId) {
        const updatedWorkOrder = {
          ...activeWorkOrder,
          status: newStatus,
          last_action_at: new Date().toISOString()
        };
        setActiveWorkOrder(updatedWorkOrder);
        toast.success(`Work order status updated to ${newStatus}`);
      }
      
      await updateWorkOrderStatus(workOrderId, newStatus);
    } catch (error) {
      console.error("Error updating work order status:", error);
      toast.error("Failed to update work order status");
      
      if (activeWorkOrder && activeWorkOrder.id === workOrderId) {
        const originalWorkOrder = workOrders.find(wo => wo.id === workOrderId);
        if (originalWorkOrder) {
          setActiveWorkOrder({...originalWorkOrder});
        }
      }
    } finally {
      isUpdatingStatus.current = false;
    }
  };

  const handleResolveFlag = async (workOrderId: string, resolution: string) => {
    try {
      isUpdatingStatus.current = true;
      
      if (activeWorkOrder && activeWorkOrder.id === workOrderId) {
        const newStatus = resolution === 'approved' ? 'resolved' : 'rejected';
        const updatedWorkOrder = {
          ...activeWorkOrder,
          status: newStatus,
          resolved_at: new Date().toISOString()
        };
        setActiveWorkOrder(updatedWorkOrder);
        toast.success(`Flag resolved as ${resolution}`);
      }
      
      await resolveWorkOrderFlag(workOrderId, resolution);
    } catch (error) {
      console.error("Error resolving flag:", error);
      toast.error("Failed to resolve flag");
      
      if (activeWorkOrder && activeWorkOrder.id === workOrderId) {
        const originalWorkOrder = workOrders.find(wo => wo.id === workOrderId);
        if (originalWorkOrder) {
          setActiveWorkOrder({...originalWorkOrder});
        }
      }
    } finally {
      isUpdatingStatus.current = false;
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Work Orders</h1>
          {isMobile && <ImportControls onOptimoRouteSearch={searchOptimoRoute} onRefresh={refetch} />}
        </div>
        
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
          isImageModalOpen={isImageModalOpen}
          activeWorkOrder={activeWorkOrder}
          onCloseImageModal={handleCloseImageViewer}
        />
      </div>
    </Layout>
  );
};

export default WorkOrders;
