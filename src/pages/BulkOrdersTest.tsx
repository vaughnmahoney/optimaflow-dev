
import React from "react";
import { Layout } from "@/components/Layout";
import { BulkOrdersWorkflow } from "@/components/bulk-orders/BulkOrdersWorkflow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RawOrdersTable } from "@/components/bulk-orders/RawOrdersTable";
import { useBulkOrdersAdapter } from "@/hooks/useBulkOrdersAdapter";
import { BulkOrdersForm } from "@/components/bulk-orders/BulkOrdersForm";

const BulkOrdersTest = () => {
  // Use the adapter to get access to raw data for the raw view tab
  const { originalData, isLoading, dataFlowLogging } = useBulkOrdersAdapter();
  
  return (
    <Layout title="Bulk Orders Processing">
      <div className="space-y-6">
        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workflow">QC Workflow</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflow" className="pt-4">
            <BulkOrdersWorkflow />
          </TabsContent>
          
          <TabsContent value="raw" className="pt-4">
            <div className="space-y-6">
              <BulkOrdersForm />
              
              {originalData.rawOrders && originalData.rawOrders.length > 0 && (
                <RawOrdersTable 
                  orders={originalData.rawOrders} 
                  isLoading={isLoading}
                  originalCount={dataFlowLogging.originalOrderCount}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default BulkOrdersTest;
