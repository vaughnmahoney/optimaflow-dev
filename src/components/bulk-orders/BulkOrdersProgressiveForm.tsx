
import { DateRangePicker } from "./DateRangePicker";
import { EndpointTabs } from "./EndpointTabs";
import { FetchButton } from "./FetchButton";
import { FetchProgressBar } from "./FetchProgressBar";
import { Card, CardContent } from "@/components/ui/card";
import { useBulkOrdersProgressiveFetch } from "@/hooks/useBulkOrdersProgressiveFetch";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Info, Package } from "lucide-react";

export const BulkOrdersProgressiveForm = () => {
  const {
    // Date state
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    
    // Loading state
    isLoading,
    
    // Tab state
    activeTab,
    setActiveTab,
    
    // Progress state
    progressState,
    
    // Response data
    rawOrders,
    
    // Stats and diagnostics
    dataFlowLogging,
    
    // Actions
    handleFetchOrders,
    pauseFetch,
    resumeFetch,
    resetFetch
  } = useBulkOrdersProgressiveFetch();

  // Calculate if bulk fetch has started
  const isFetchStarted = progressState.currentPage > 0 || progressState.isComplete;
  
  // Create derived status counts for display
  const statusCounts = {
    approved: 0,
    pending_review: rawOrders ? rawOrders.length : 0,
    flagged: 0,
    resolved: 0,
    rejected: 0,
    all: rawOrders ? rawOrders.length : 0
  };

  return (
    <div className="space-y-6">
      {/* Controls section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <EndpointTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              
              <div className="ml-auto flex items-center gap-2">
                <FetchButton 
                  isLoading={isLoading} 
                  onFetch={handleFetchOrders}
                  isDisabled={!startDate || !endDate || progressState.isLoading}
                  activeTab={activeTab}
                />
              </div>
            </div>
            
            {/* Progress bar */}
            <FetchProgressBar 
              state={progressState}
              onPause={pauseFetch}
              onResume={resumeFetch}
              onReset={resetFetch}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Processing stats section (only show when data is loading/loaded) */}
      {isFetchStarted && (
        <Card className="bg-slate-50">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Total Orders: </span>
                  <Badge variant="outline" className="bg-white ml-1">
                    {progressState.totalOrders || 'Loading...'}
                  </Badge>
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Processed: </span>
                  <Badge variant="outline" className="bg-white ml-1">
                    {progressState.processedOrders}
                  </Badge>
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Current Batch: </span>
                  <Badge variant="outline" className="bg-white ml-1">
                    {progressState.currentPage}/{progressState.totalPages || '?'}
                  </Badge>
                </span>
              </div>
              
              {rawOrders && rawOrders.length > 0 && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Ready for Review: </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 ml-1">
                      {rawOrders.length}
                    </Badge>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Display a message when no orders have been fetched */}
      {!isLoading && rawOrders && rawOrders.length === 0 && !progressState.isComplete && (
        <div className="bg-slate-50 border rounded-md p-8 text-center">
          <h3 className="text-lg font-medium text-slate-800 mb-2">No orders loaded</h3>
          <p className="text-slate-600 mb-4">Select a date range and click "Fetch Orders" to retrieve work orders.</p>
        </div>
      )}
      
      {/* Only show work order content when there are orders */}
      {rawOrders && rawOrders.length > 0 && (
        <WorkOrderContent
          workOrders={rawOrders}
          isLoading={isLoading}
          filters={{
            status: null,
            dateRange: { from: null, to: null },
            driver: null,
            location: null,
            orderNo: null
          }}
          onFiltersChange={() => {}}
          onStatusUpdate={() => {}}
          onImageView={() => {}}
          onDelete={() => {}}
          onOptimoRouteSearch={() => {}}
          statusCounts={statusCounts}
          sortField="service_date"
          sortDirection="desc"
          onSort={() => {}}
          pagination={{
            page: 1,
            pageSize: 10,
            total: rawOrders.length
          }}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          onColumnFilterChange={() => {}}
          clearColumnFilter={() => {}}
          clearAllFilters={() => {}}
        />
      )}
    </div>
  );
};
