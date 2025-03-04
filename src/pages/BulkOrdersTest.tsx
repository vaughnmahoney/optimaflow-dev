
import { BulkOrdersForm } from "@/components/bulk-orders/BulkOrdersForm";
import { FetchProgressBar } from "@/components/bulk-orders/FetchProgressBar";
import { BulkOrdersTable } from "@/components/bulk-orders/BulkOrdersTable";
import { useBulkOrdersFetch } from "@/hooks/useBulkOrdersFetch";
import { Layout } from "@/components/Layout";

const BulkOrdersTest = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    response,
    transformedOrders,
    activeTab,
    setActiveTab,
    shouldContinueFetching,
    handleFetchOrders
  } = useBulkOrdersFetch();

  console.log("BulkOrdersTest: transformedOrders.length =", transformedOrders.length);
  console.log("BulkOrdersTest: isLoading =", isLoading, "shouldContinueFetching =", shouldContinueFetching);
  
  // Add debug logging for the first raw order response if available
  if (response?.orders && response.orders.length > 0) {
    console.log("Raw order example (first order):", response.orders[0]);
  }
  
  const orderCount = response?.totalCount || transformedOrders.length;
  const filteredCount = response?.filteredCount || 0;

  return (
    <Layout title="Bulk Orders Test">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium mb-4">Bulk Orders Retrieval</h2>
          
          <BulkOrdersForm
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isLoading={isLoading || shouldContinueFetching}
            onFetchOrders={handleFetchOrders}
          />
        </div>
        
        <FetchProgressBar 
          response={response} 
          isLoading={isLoading} 
          shouldContinueFetching={shouldContinueFetching} 
        />
        
        {response && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">
                Orders {response.paginationProgress?.isComplete ? "(Complete)" : "(In Progress)"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === "with-completion" 
                  ? `Found ${filteredCount} completed orders out of ${orderCount} total orders`
                  : `Found ${orderCount} orders`
                }
              </p>
            </div>
            
            <BulkOrdersTable 
              orders={transformedOrders} 
              isLoading={isLoading || shouldContinueFetching} 
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BulkOrdersTest;
