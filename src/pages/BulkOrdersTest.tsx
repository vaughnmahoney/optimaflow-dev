
import React from "react";
import { Layout } from "@/components/Layout";
import { WorkOrderInfoCard } from "@/components/workorders/InfoCard";
import { BulkOrdersInfoCard } from "@/components/bulk-orders/BulkOrdersInfoCard";
import { BulkOrdersProgressiveForm } from "@/components/bulk-orders/BulkOrdersProgressiveForm";
import { AutoImportStatus } from "@/components/bulk-orders/AutoImportStatus";

const BulkOrdersTest = () => {
  return (
    <Layout title="Bulk Orders Processing">
      <div className="space-y-6">
        {/* Work Order Info Card */}
        <WorkOrderInfoCard />
        
        {/* Auto Import Status Card */}
        <AutoImportStatus className="bg-white" />
        
        {/* Bulk Orders Specific Instructions */}
        <BulkOrdersInfoCard />
        
        {/* Progressive Loading Form - our main and only import method now */}
        <BulkOrdersProgressiveForm />
      </div>
    </Layout>
  );
};

export default BulkOrdersTest;
