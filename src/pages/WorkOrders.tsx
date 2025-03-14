
import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { WorkOrderHeader } from "@/components/workorders/WorkOrderHeader";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";

const WorkOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { resolveWorkOrderFlag } = useWorkOrderMutations();
  
  const {
    data: workOrders,
    isLoading, 
    searchOptimoRoute,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder,
    statusCounts,
    refetch
  } = useWorkOrderData();

  // Prefetch flagged work order count
  useEffect(() => {
    queryClient.prefetchQuery({ 
      queryKey: ["flaggedWorkOrdersCount"]
    });
  }, [queryClient]);

  // Redirect to main work orders page if on a nested route
  useEffect(() => {
    if (location.pathname.match(/\/work-orders\/[^/]+$/)) {
      navigate("/work-orders", { replace: true });
    }
  }, [location.pathname, navigate]);

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
          onStatusUpdate={updateWorkOrderStatus}
          onImageView={openImageViewer}
          onDelete={deleteWorkOrder}
          onOptimoRouteSearch={searchOptimoRoute}
          statusCounts={statusCounts}
          onResolveFlag={resolveWorkOrderFlag}
        />
      </div>
    </Layout>
  );
};

export default WorkOrders;
