
import { DateRangePicker } from "./DateRangePicker";
import { FetchButton } from "./FetchButton";
import { EndpointTabs } from "./EndpointTabs";
import { ApiResponseDisplay } from "./ApiResponseDisplay";
import { RawOrdersTable } from "./RawOrdersTable";
import { useBulkOrdersFetch } from "@/hooks/useBulkOrdersFetch";
import { FetchProgressBar } from "./FetchProgressBar";

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
    originalOrders,
    activeTab,
    setActiveTab,
    shouldContinueFetching,
    handleFetchOrders,
  } = useBulkOrdersFetch();

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
            
            {shouldContinueFetching && (
              <FetchProgressBar 
                isActive={shouldContinueFetching}
                currentCount={originalOrders?.length || 0} 
              />
            )}
          </div>
        </div>
        
        {rawOrders && rawOrders.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Retrieved Orders</h2>
            <RawOrdersTable 
              orders={rawOrders} 
              isLoading={isLoading}
              originalCount={originalOrders?.length} 
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
