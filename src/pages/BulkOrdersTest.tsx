
import { BulkOrdersForm } from "@/components/bulk-orders/BulkOrdersForm";
import { ApiResponseDisplay } from "@/components/bulk-orders/ApiResponseDisplay";
import { FetchProgressBar } from "@/components/bulk-orders/FetchProgressBar";
import { useBulkOrdersFetch } from "@/hooks/useBulkOrdersFetch";

const BulkOrdersTest = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    response,
    activeTab,
    setActiveTab,
    shouldContinueFetching,
    handleFetchOrders
  } = useBulkOrdersFetch();

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Bulk Orders API Test</h1>
      
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
      
      <FetchProgressBar 
        response={response} 
        isLoading={isLoading} 
        shouldContinueFetching={shouldContinueFetching} 
      />
      
      <ApiResponseDisplay response={response} />
    </div>
  );
};

export default BulkOrdersTest;
