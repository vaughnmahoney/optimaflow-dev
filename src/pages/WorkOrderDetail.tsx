
import { Layout } from "@/components/Layout";
import { WorkOrderDetailsSidebar } from "@/components/workorders/WorkOrderDetailsSidebar";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useParams } from "react-router-dom";

const WorkOrderDetail = () => {
  const { id } = useParams();
  const { workOrder, isLoading } = useWorkOrderData(id || null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!workOrder) {
    return <div>Work order not found</div>;
  }

  return (
    <Layout>
      <div className="flex">
        <WorkOrderDetailsSidebar 
          workOrder={workOrder}
          onClose={() => window.history.back()}
          onStatusUpdate={(status) => {
            console.log('Status update:', status);
          }}
          onDownloadAll={() => {
            console.log('Download all');
          }}
        />
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Work Order Details</h1>
          {/* Additional content can be added here */}
        </div>
      </div>
    </Layout>
  );
};

export default WorkOrderDetail;
