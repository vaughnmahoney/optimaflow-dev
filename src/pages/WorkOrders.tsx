
import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { WorkOrderHeader } from "@/components/workorders/WorkOrderHeader";

const WorkOrders = () => {
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
