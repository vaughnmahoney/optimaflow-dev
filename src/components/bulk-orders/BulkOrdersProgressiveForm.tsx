
import { DateRangePicker } from "./DateRangePicker";
import { EndpointTabs } from "./EndpointTabs";
import { FetchButton } from "./FetchButton";
import { FetchProgressBar } from "./FetchProgressBar";
import { Card, CardContent } from "@/components/ui/card";
import { useBulkOrdersProgressiveFetch } from "@/hooks/useBulkOrdersProgressiveFetch";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

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
      
      {/* Simplified stats section - only show when fetching is complete */}
      {progressState.isComplete && rawOrders && rawOrders.length > 0 && (
        <Card className="bg-slate-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">Filtered Orders: </span>
                <Badge variant="outline" className="bg-green-50 text-green-700 ml-1">
                  {rawOrders.length}
                </Badge>
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Display a message when no orders have been fetched */}
      {!isLoading && (!rawOrders || rawOrders.length === 0) && !progressState.isComplete && (
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
