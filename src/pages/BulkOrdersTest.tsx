
import React from "react";
import { Layout } from "@/components/Layout";
import { RawOrdersTable } from "@/components/bulk-orders/RawOrdersTable";
import { useBulkOrdersAdapter } from "@/hooks/useBulkOrdersAdapter";
import { BulkOrdersForm } from "@/components/bulk-orders/BulkOrdersForm";
import { ApiResponseDisplay } from "@/components/bulk-orders/ApiResponseDisplay";
import { WorkOrderInfoCard } from "@/components/workorders/InfoCard";

const BulkOrdersTest = () => {
  // Use the adapter to get access to raw data for the raw view tab
  const { originalData, isLoading, dataFlowLogging } = useBulkOrdersAdapter();
  
  return (
    <Layout title="Bulk Orders Processing">
      <div className="space-y-6">
        {/* Add the info card */}
        <WorkOrderInfoCard />
        
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
