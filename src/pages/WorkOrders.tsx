
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
    data: workOrders,
    isLoading, 
    statusFilter, 
    setStatusFilter,
    searchWorkOrder,
    searchOptimoRoute,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder
  } = useWorkOrderData();

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
        <WorkOrderContent />
      </div>
    </Layout>
  );
};

export default WorkOrders;
