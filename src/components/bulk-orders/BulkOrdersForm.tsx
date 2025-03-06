
import { DateRangePicker } from "./DateRangePicker";
import { FetchButton } from "./FetchButton";
import { EndpointTabs } from "./EndpointTabs";
import { ApiResponseDisplay } from "./ApiResponseDisplay";
import { RawOrdersTable } from "./RawOrdersTable";
import { useBulkOrdersFetch } from "@/hooks/useBulkOrdersFetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

export const BulkOrdersForm = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    response,
    rawData,
    rawOrders,
    activeTab,
    setActiveTab,
    dataFlowLogging,
    handleFetchOrders,
  } = useBulkOrdersFetch();

  // Output data flow diagnostics whenever stats update
  useEffect(() => {
    if (rawOrders && rawOrders.length > 0) {
      console.log("Current data flow stats:", {
        dataFlowLogging
      });
    }
  }, [rawOrders, dataFlowLogging]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Bulk Order Retrieval</h2>
          
          <div className="space-y-6">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            
            <EndpointTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            <FetchButton
              onFetch={handleFetchOrders}
              isDisabled={isLoading || !startDate || !endDate}
              isLoading={isLoading}
              activeTab={activeTab}
            />
          </div>
        </div>
        
        {/* Diagnostic Info Card - only show if we have data */}
        {rawOrders && rawOrders.length > 0 && (
          <Card className="bg-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order Processing Diagnostics</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="space-y-1 font-mono">
                <p>API Requests: {dataFlowLogging.apiRequests}</p>
                <p>Total Orders from API: {dataFlowLogging.totalOrdersFromAPI || 'N/A'}</p>
                <p>After Status Filtering: {rawOrders.length}</p>
                {dataFlowLogging.batchStats && (
                  <p>Completion Batches: {dataFlowLogging.batchStats.completedBatches}/{dataFlowLogging.batchStats.totalBatches}</p>
                )}
                {Object.keys(dataFlowLogging).length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Show Debug Info
                    </summary>
                    <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(dataFlowLogging, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {rawOrders && rawOrders.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Retrieved Orders</h2>
            <RawOrdersTable 
              orders={rawOrders} 
              isLoading={isLoading}
              originalCount={dataFlowLogging.originalOrderCount}
            />
          </div>
        )}
        
        {response && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>
            <ApiResponseDisplay response={response} />
          </div>
        )}
      </div>
    </div>
  );
};
