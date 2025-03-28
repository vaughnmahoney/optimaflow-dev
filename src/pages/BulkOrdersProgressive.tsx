
import { Layout } from "@/components/Layout";
import { WorkOrderInfoCard } from "@/components/workorders/InfoCard";
import { BulkOrdersInfoCard } from "@/components/bulk-orders/BulkOrdersInfoCard";
import { BulkOrdersProgressiveForm } from "@/components/bulk-orders/BulkOrdersProgressiveForm";

const BulkOrdersProgressive = () => {
  return (
    <Layout title="Bulk Orders - Progressive Loading">
      <div className="space-y-6">
        {/* Work Order Info Card */}
        <WorkOrderInfoCard />
        
        {/* Bulk Orders Specific Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <h3 className="text-amber-800 font-medium text-sm mb-2">Progressive Loading Mode</h3>
          <p className="text-amber-700 text-sm">
            This mode fetches data in smaller batches to avoid memory limits and Supabase rate limits.
            You'll see progress updates as data is loaded, and you can pause/resume the loading process.
          </p>
        </div>
        
        {/* Progressive loading form */}
        <BulkOrdersProgressiveForm />
      </div>
    </Layout>
  );
};

export default BulkOrdersProgressive;
