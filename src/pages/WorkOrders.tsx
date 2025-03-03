
import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { WorkOrderHeader } from "@/components/workorders/WorkOrderHeader";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useQueryClient } from "@tanstack/react-query";
import { SortDirection, SortField } from "@/components/workorders/types";

const WorkOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
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
    handlePageSizeChange
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

  return (
    <Layout
      title="Work Orders"
      header={
        <WorkOrderHeader 
          onOptimoRouteSearch={searchOptimoRoute}
        />
      }
    >
      <div className="space-y-8">
        <WorkOrderContent 
          workOrders={workOrders}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          onStatusUpdate={updateWorkOrderStatus}
          onImageView={openImageViewer}
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
        />
      </div>
    </Layout>
  );
};

export default WorkOrders;
