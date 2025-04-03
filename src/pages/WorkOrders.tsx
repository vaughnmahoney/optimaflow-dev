import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { WorkOrderHeader } from "@/components/workorders/WorkOrderHeader";
import { ImportControls } from "@/components/workorders/ImportControls";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useQueryClient } from "@tanstack/react-query";
import { SortDirection, SortField } from "@/components/workorders/types";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { useIsMobile } from "@/hooks/use-mobile";

const WorkOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { resolveWorkOrderFlag } = useWorkOrderMutations();
  const isMobile = useIsMobile();
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  
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
    openImageViewer,
    deleteWorkOrder,
    statusCounts,
    sortField,
    sortDirection,
    setSort,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    refetch,
    cachedWorkOrder,
    clearCachedWorkOrder
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

  const handleOpenImageViewer = (workOrderId: string) => {
    setSelectedWorkOrderId(workOrderId);
    setIsImageModalOpen(true);
    openImageViewer(workOrderId);
  };

  const handleCloseImageViewer = () => {
    setIsImageModalOpen(false);
    setTimeout(() => {
      setSelectedWorkOrderId(null);
      clearCachedWorkOrder();
    }, 300);
  };

  const handleUpdateStatus = async (workOrderId: string, newStatus: string) => {
    await updateWorkOrderStatus(workOrderId, newStatus);
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
          onStatusUpdate={handleUpdateStatus}
          onImageView={handleOpenImageViewer}
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
          onResolveFlag={resolveWorkOrderFlag}
          cachedWorkOrder={cachedWorkOrder}
          clearCachedWorkOrder={clearCachedWorkOrder}
          isImageModalOpen={isImageModalOpen}
          selectedWorkOrderId={selectedWorkOrderId}
          onCloseImageModal={handleCloseImageViewer}
        />
      </div>
    </Layout>
  );
};

export default WorkOrders;
