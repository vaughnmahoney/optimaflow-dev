
import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { WorkOrderHeader } from "@/components/workorders/WorkOrderHeader";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const WorkOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we're on a work order detail route, redirect to the main list
    if (location.pathname.match(/\/work-orders\/[^/]+$/)) {
      navigate("/work-orders", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <Layout>
      <div className="space-y-8">
        <WorkOrderHeader />
        <WorkOrderContent />
      </div>
    </Layout>
  );
};

export default WorkOrders;
