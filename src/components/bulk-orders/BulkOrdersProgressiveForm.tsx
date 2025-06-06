import { DateRangePicker } from "./DateRangePicker";
import { EndpointTabs } from "./EndpointTabs";
import { FetchButton } from "./FetchButton";
import { FetchProgressBar } from "./FetchProgressBar";
import { Card, CardContent } from "@/components/ui/card";
import { useBulkOrdersProgressiveFetch } from "@/hooks/useBulkOrdersProgressiveFetch";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { Badge } from "@/components/ui/badge";
import { Package, Upload, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useBulkOrderImport } from "@/hooks/bulk-orders/useBulkOrderImport";
import { Button } from "@/components/ui/button";
import { SortDirection, SortField } from "@/components/workorders/types";

export const BulkOrdersProgressiveForm = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    
    isLoading,
    
    activeTab,
    setActiveTab,
    
    progressState,
    
    rawOrders,
    
    handleFetchOrders,
    pauseFetch,
    resumeFetch,
    resetFetch
  } = useBulkOrdersProgressiveFetch();

  const { 
    importOrders, 
    isImporting, 
    importResult, 
    importProgress 
  } = useBulkOrderImport();

  const [hasTriggeredAutoSave, setHasTriggeredAutoSave] = useState(false);
  const [manualSaveEnabled, setManualSaveEnabled] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortDirection>('desc');

  const isFetchStarted = progressState.currentPage > 0 || progressState.isComplete;

  const statusCounts = {
    approved: 0,
    pending_review: rawOrders ? rawOrders.length : 0,
    flagged: 0,
    resolved: 0,
    rejected: 0,
    all: rawOrders ? rawOrders.length : 0
  };

  const handleManualImport = async () => {
    if (rawOrders && rawOrders.length > 0) {
      console.log(`Manually importing ${rawOrders.length} orders to database...`);
      await importOrders(rawOrders);
    }
  };

  useEffect(() => {
    const autoSaveToDatabase = async () => {
      if (
        progressState.isComplete && 
        rawOrders && 
        rawOrders.length > 0 && 
        !isImporting && 
        !importResult && 
        !hasTriggeredAutoSave &&
        !manualSaveEnabled
      ) {
        setTimeout(async () => {
          console.log(`Auto-saving ${rawOrders.length} orders to database...`);
          setHasTriggeredAutoSave(true);
          await importOrders(rawOrders);
        }, 1000);
      }
    };
    
    autoSaveToDatabase();
  }, [progressState.isComplete, rawOrders, isImporting, importResult, importOrders, hasTriggeredAutoSave, manualSaveEnabled]);

  useEffect(() => {
    if (isLoading && progressState.currentPage === 1) {
      setHasTriggeredAutoSave(false);
    }
  }, [isLoading, progressState.currentPage]);

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortOrder(direction);
  };

  return (
    <div className="space-y-6">
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setManualSaveEnabled(!manualSaveEnabled)}
                  className={manualSaveEnabled ? "border-amber-500 text-amber-700" : ""}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {manualSaveEnabled ? "Auto-save disabled" : "Auto-save enabled"}
                </Button>
                
                <FetchButton 
                  isLoading={isLoading} 
                  onFetch={handleFetchOrders}
                  isDisabled={!startDate || !endDate || progressState.isLoading || isImporting}
                  activeTab={activeTab}
                />
              </div>
            </div>
            
            <FetchProgressBar 
              state={progressState}
              onPause={pauseFetch}
              onResume={resumeFetch}
              onReset={resetFetch}
            />
            
            {isImporting && (
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">
                    Saving to database: {importProgress.percentage}%
                  </span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${importProgress.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {importProgress.current} of {importProgress.total} orders processed
                </div>
              </div>
            )}
            
            {importResult && !isImporting && (
              <div className={`mt-2 ${importResult.success ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'} border rounded p-3`}>
                <div className="flex items-center gap-2">
                  <Upload className={`h-4 w-4 ${importResult.success ? 'text-green-500' : 'text-amber-500'}`} />
                  <span className={`text-sm font-medium ${importResult.success ? 'text-green-700' : 'text-amber-700'}`}>
                    {importResult.success ? 'Orders saved to database' : 'Some orders failed to save'}
                  </span>
                </div>
                <div className="text-xs mt-1 flex flex-wrap gap-x-4">
                  <span>Total: {importResult.total}</span>
                  <span>Imported: {importResult.imported}</span>
                  <span>Duplicates: {importResult.duplicates}</span>
                  {importResult.errors > 0 && <span>Errors: {importResult.errors}</span>}
                </div>
              </div>
            )}
            
            {progressState.isComplete && manualSaveEnabled && rawOrders && rawOrders.length > 0 && !isImporting && (
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleManualImport} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import {rawOrders.length} Orders to Database
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
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
      
      {!isLoading && (!rawOrders || rawOrders.length === 0) && !progressState.isComplete && (
        <div className="bg-slate-50 border rounded-md p-8 text-center">
          <h3 className="text-lg font-medium text-slate-800 mb-2">No orders loaded</h3>
          <p className="text-slate-600 mb-4">Select a date range and click "Fetch Orders" to retrieve work orders.</p>
        </div>
      )}
      
      {rawOrders && rawOrders.length > 0 && (
        <WorkOrderContent
          workOrders={rawOrders}
          isLoading={isLoading}
          filters={{
            status: null,
            dateRange: { from: null, to: null },
            driver: null,
            location: null,
            orderNo: null,
            optimoRouteStatus: null
          }}
          onFiltersChange={() => {}}
          onStatusUpdate={() => {}}
          onImageView={() => {}}
          onDelete={() => {}}
          onOptimoRouteSearch={() => {}}
          statusCounts={statusCounts}
          sortField="end_time"
          sortDirection={sortOrder}
          onSort={handleSort}
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
