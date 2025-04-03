
import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { WorkOrderHeader } from "@/components/workorders/WorkOrderHeader";
import { ImportControls } from "@/components/workorders/ImportControls";
import { useEffect } from "react";
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
  const { resolveWorkOrderFlag, updateWorkOrderStatus } = useWorkOrderMutations();
  const isMobile = useIsMobile();
  
  const {
    data: workOrders,
    isLoading, 
    filters,
    setFilters,
    onColumnFilterChange,
    clearColumnFilter,
    clearAllFilters,
    openImageViewer,
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
  
  // Enhanced status update with filter-aware navigation
  const handleStatusUpdate = (workOrderId: string, newStatus: string, options?: any) => {
    updateWorkOrderStatus(workOrderId, newStatus, options);
  };
  
  // Enhanced flag resolution with filter-aware navigation
  const handleResolveFlag = (workOrderId: string, resolution: string, options?: any) => {
    resolveWorkOrderFlag(workOrderId, resolution, options);
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
          {isMobile && <ImportControls onRefresh={refetch} />}
        </div>
        
        {/* Import controls - only shown on desktop */}
        {!isMobile && (
          <ImportControls onRefresh={refetch} />
        )}
        
        <WorkOrderContent 
          workOrders={workOrders}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          onStatusUpdate={handleStatusUpdate}
          onImageView={openImageViewer}
          onDelete={deleteWorkOrder}
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
        />
      </div>
    </Layout>
  );
};

export default WorkOrders;
