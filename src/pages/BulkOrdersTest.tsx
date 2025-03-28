
import React from "react";
import { Layout } from "@/components/Layout";
import { RawOrdersTable } from "@/components/bulk-orders/RawOrdersTable";
import { useBulkOrdersAdapter } from "@/hooks/useBulkOrdersAdapter";
import { BulkOrdersForm } from "@/components/bulk-orders/BulkOrdersForm";
import { ApiResponseDisplay } from "@/components/bulk-orders/ApiResponseDisplay";
import { WorkOrderInfoCard } from "@/components/workorders/InfoCard";
import { BulkOrdersInfoCard } from "@/components/bulk-orders/BulkOrdersInfoCard";

const BulkOrdersTest = () => {
  // Use the adapter to get access to raw data for the raw view tab
  const { originalData, isLoading, dataFlowLogging } = useBulkOrdersAdapter();
  
  return (
    <Layout title="Bulk Orders Processing">
      <div className="space-y-6">
        {/* Work Order Info Card */}
        <WorkOrderInfoCard />
        
        {/* Bulk Orders Specific Instructions */}
        <BulkOrdersInfoCard />
        
        <BulkOrdersForm />
        
        {originalData.response && (
          <ApiResponseDisplay response={originalData.response} />
        )}
        
        {originalData.rawOrders && originalData.rawOrders.length > 0 && (
          <RawOrdersTable 
            orders={originalData.rawOrders} 
            isLoading={isLoading}
            originalCount={dataFlowLogging.originalOrderCount}
          />
        )}
      </div>
    </Layout>
  );
};

export default BulkOrdersTest;
