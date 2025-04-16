
import { useState } from "react";
import { useBulkOrdersAdapter } from "@/hooks/useBulkOrdersAdapter";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { DateRangePicker } from "./DateRangePicker";
import { EndpointTabs } from "./EndpointTabs";
import { FetchButton } from "./FetchButton";
import { FetchProgressBar } from "./FetchProgressBar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle, Clock, Info } from "lucide-react";

export const BulkOrdersWorkflow = () => {
  const [showApi, setShowApi] = useState(false);
  
  const {
    // Bulk order specific properties
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    activeTab,
    setActiveTab,
    handleFetchOrders,
    dataFlowLogging,
    originalData,
    
    // Work order component compatible properties
    data: workOrders,
    isLoading,
    filters,
    setFilters,
    onColumnFilterChange,
    clearColumnFilter,
    clearAllFilters,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder,
    statusCounts,
    sortField,
    sortDirection,
    setSort,
    pagination,
    handlePageChange,
    handlePageSizeChange
  } = useBulkOrdersAdapter();
  
  // Calculate if bulk fetch has completed
  const isFetchComplete = originalData.rawOrders && originalData.rawOrders.length > 0;
  
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
                  isDisabled={!startDate || !endDate}
                  activeTab={activeTab}
                />
              </div>
            </div>
            
            {isLoading && dataFlowLogging.batchStats && (
              <FetchProgressBar 
                processing={isLoading}
                stats={dataFlowLogging.batchStats}
              />
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Processing stats section (only show when data is loaded) */}
      {isFetchComplete && (
        <Card className="bg-slate-50">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Total Orders: </span>
                  <Badge variant="outline" className="bg-white ml-1">
                    {dataFlowLogging.totalOrdersFromAPI}
                  </Badge>
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">With Completion: </span>
                  <Badge variant="outline" className="bg-white ml-1">
                    {dataFlowLogging.statusFilteredOrders}
                  </Badge>
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Processed: </span>
                  <Badge variant="outline" className="bg-white ml-1">
                    {workOrders.length}
                  </Badge>
                </span>
              </div>
              
              {dataFlowLogging.originalOrderCount !== workOrders.length && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Duplicates Removed: </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 ml-1">
                      {dataFlowLogging.originalOrderCount - workOrders.length}
                    </Badge>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Display a message when no orders have been fetched */}
      {!isLoading && workOrders.length === 0 && (
        <div className="bg-slate-50 border rounded-md p-8 text-center">
          <h3 className="text-lg font-medium text-slate-800 mb-2">No orders loaded</h3>
          <p className="text-slate-600 mb-4">Select a date range and click "Fetch Orders" to retrieve work orders.</p>
        </div>
      )}
      
      {/* Only show work order content when there are orders */}
      {workOrders.length > 0 && (
        <WorkOrderContent
          workOrders={workOrders}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          onStatusUpdate={updateWorkOrderStatus}
          onImageView={openImageViewer}
          onDelete={deleteWorkOrder}
          onOptimoRouteSearch={() => {}}
          statusCounts={{
            approved: statusCounts.approved,
            pending_review: statusCounts.pending_review,
            flagged: statusCounts.flagged,
            resolved: statusCounts.resolved || 0,
            rejected: statusCounts.rejected || 0,
            all: statusCounts.all
          }}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={setSort}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onColumnFilterChange={onColumnFilterChange}
          clearColumnFilter={clearColumnFilter}
          clearAllFilters={clearAllFilters}
        />
      )}
    </div>
  );
};
