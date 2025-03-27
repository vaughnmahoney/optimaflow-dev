
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { RawOrdersTable } from "@/components/bulk-orders/RawOrdersTable";
import { useBulkOrdersAdapter } from "@/hooks/useBulkOrdersAdapter";
import { BulkOrdersForm } from "@/components/bulk-orders/BulkOrdersForm";
import { ApiResponseDisplay } from "@/components/bulk-orders/ApiResponseDisplay";
import { WorkOrderInfoCard } from "@/components/workorders/InfoCard";
import { BulkOrdersInfoCard } from "@/components/bulk-orders/BulkOrdersInfoCard";
import { BulkOrdersProgressiveForm } from "@/components/bulk-orders/BulkOrdersProgressiveForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutoImportStatus } from "@/components/bulk-orders/AutoImportStatus";

const BulkOrdersTest = () => {
  // Use the adapter to get access to raw data for the raw view tab
  const { originalData, isLoading, dataFlowLogging } = useBulkOrdersAdapter();
  
  // Tab state for switching between legacy and progressive modes
  const [mode, setMode] = useState<"legacy" | "progressive">("progressive");
  
  return (
    <Layout title="Bulk Orders Processing">
      <div className="space-y-6">
        {/* Work Order Info Card */}
        <WorkOrderInfoCard />
        
        {/* Auto Import Status Card */}
        <AutoImportStatus className="bg-white" />
        
        {/* Bulk Orders Specific Instructions */}
        <BulkOrdersInfoCard />
        
        {/* Mode selector tabs */}
        <Tabs defaultValue={mode} onValueChange={(value) => setMode(value as "legacy" | "progressive")}>
          <TabsList className="mb-4">
            <TabsTrigger value="progressive">Progressive Loading</TabsTrigger>
            <TabsTrigger value="legacy">Legacy Mode</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progressive">
            <BulkOrdersProgressiveForm />
          </TabsContent>
          
          <TabsContent value="legacy">
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default BulkOrdersTest;
