
import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { WorkOrderHeader } from "@/components/workorders/WorkOrderHeader";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useQueryClient } from "@tanstack/react-query";

const WorkOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  
  const {
    data: workOrders,
    isLoading, 
    statusFilter, 
    setStatusFilter,
    searchWorkOrder,
    searchOptimoRoute,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder,
    statusCounts
  } = useWorkOrderData();

  // Prefetch flagged count when we enter this page
  useEffect(() => {
    queryClient.prefetchQuery({ 
      queryKey: ["flaggedWorkOrdersCount"]
    });
  }, [queryClient]);

  useEffect(() => {
    // If we're on a work order detail route, redirect to the main list
    if (location.pathname.match(/\/work-orders\/[^/]+$/)) {
      navigate("/work-orders", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <Layout
      title="Work Orders"
      header={
        <WorkOrderHeader 
          onSearchChange={setSearchQuery}
          onOptimoRouteSearch={searchOptimoRoute}
          searchQuery={searchQuery}
        />
      }
    >
      <div className="space-y-8">
        <WorkOrderContent 
          workOrders={workOrders}
          isLoading={isLoading}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onStatusUpdate={updateWorkOrderStatus}
          onImageView={openImageViewer}
          onDelete={deleteWorkOrder}
          searchQuery={searchQuery}
          onSearchChange={searchWorkOrder}
          onOptimoRouteSearch={searchOptimoRoute}
          statusCounts={statusCounts}
        />
      </div>
    </Layout>
  );
};

export default WorkOrders;
