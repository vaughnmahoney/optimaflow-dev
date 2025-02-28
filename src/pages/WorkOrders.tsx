
import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { WorkOrderHeader } from "@/components/workorders/WorkOrderHeader";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";

const WorkOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    workOrders, 
    isLoading, 
    statusFilter, 
    setStatusFilter,
    searchWorkOrder,
    searchOptimoRoute,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder
  } = useWorkOrderData(searchQuery);

  useEffect(() => {
    // If we're on a work order detail route, redirect to the main list
    if (location.pathname.match(/\/work-orders\/[^/]+$/)) {
      navigate("/work-orders", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <Layout
      header={
        <WorkOrderHeader 
          onSearchChange={setSearchQuery}
          onOptimoRouteSearch={searchOptimoRoute}
          searchQuery={searchQuery}
        />
      }
    >
      <div className="space-y-8">
        <WorkOrderList 
          workOrders={workOrders} 
          isLoading={isLoading}
          onSearchChange={searchWorkOrder}
          onOptimoRouteSearch={searchOptimoRoute}
          onStatusFilterChange={setStatusFilter}
          onStatusUpdate={updateWorkOrderStatus}
          onImageView={openImageViewer}
          onDelete={deleteWorkOrder}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
        />
      </div>
    </Layout>
  );
};

// Internal component to avoid circular references
const WorkOrderList = ({
  workOrders,
  isLoading,
  onSearchChange,
  onOptimoRouteSearch,
  onStatusFilterChange,
  onStatusUpdate,
  onImageView,
  onDelete,
  searchQuery,
  statusFilter
}) => {
  return (
    <WorkOrderContent
      workOrders={workOrders}
      isLoading={isLoading}
      onSearchChange={onSearchChange}
      onOptimoRouteSearch={onOptimoRouteSearch}
      onStatusFilterChange={onStatusFilterChange}
      onStatusUpdate={onStatusUpdate}
      onImageView={onImageView}
      onDelete={onDelete}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
    />
  );
};

export default WorkOrders;
