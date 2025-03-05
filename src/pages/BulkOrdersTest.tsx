
import { BulkOrdersForm } from "@/components/bulk-orders/BulkOrdersForm";
import { FetchProgressBar } from "@/components/bulk-orders/FetchProgressBar";
import { useBulkOrdersFetch } from "@/hooks/useBulkOrdersFetch";
import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { useBulkOrderWorkOrders } from "@/hooks/useBulkOrderWorkOrders";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BulkOrdersTest = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    isProcessing,
    response,
    transformedOrders,
    rawData,
    activeTab,
    setActiveTab,
    shouldContinueFetching,
    handleFetchOrders,
    transformStats
  } = useBulkOrdersFetch();

  // Use our adapter hook to prepare data for WorkOrderContent
  const {
    workOrders,
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
  } = useBulkOrderWorkOrders(transformedOrders, isProcessing || shouldContinueFetching);
  
  console.log("BulkOrdersTest: transformedOrders.length =", transformedOrders.length);
  console.log("BulkOrdersTest: filtered workOrders.length =", workOrders.length);
  
  const orderCount = response?.totalCount || transformedOrders.length;
  const filteredCount = activeTab === "with-completion" 
    ? response?.filteredCount || transformedOrders.length
    : response?.filteredCount || 0;

  // Placeholder function since we don't need OptimoRoute search in the bulk view
  const handleOptimoRouteSearch = (value: string) => {
    console.log('OptimoRoute search not implemented in bulk view:', value);
  };

  // Function to render raw orders data for debugging
  const renderRawOrdersTable = () => {
    if (!rawData || !rawData.orders || rawData.orders.length === 0) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No raw data available</AlertTitle>
          <AlertDescription>
            Fetch some orders first to see the raw data.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="overflow-auto max-h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Driver Name</TableHead>
              <TableHead>Tracking URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Structure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rawData.orders.map((order: any, index: number) => {
              // Extract key fields from various possible locations
              const orderNo = order.data?.orderNo || order.orderNo || order.id || `Unknown-${index}`;
              const driverName = order.scheduleInformation?.driverName || 
                                order.extracted?.driverName || 
                                'N/A';
              const trackingUrl = order.completionDetails?.data?.tracking_url || 
                                 order.extracted?.tracking_url || 
                                 'N/A';
              const status = order.completion_status || 
                           order.completionDetails?.data?.status || 
                           'Unknown';
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{orderNo}</TableCell>
                  <TableCell>{driverName}</TableCell>
                  <TableCell>
                    {trackingUrl !== 'N/A' ? (
                      <a href={trackingUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-500 hover:underline">
                        {trackingUrl.substring(0, 30)}...
                      </a>
                    ) : trackingUrl}
                  </TableCell>
                  <TableCell>{status}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      <pre className="text-xs">
                        {JSON.stringify(order, null, 2).substring(0, 100)}...
                      </pre>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Layout title="Bulk Orders Import">
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
            isLoading={isProcessing || shouldContinueFetching}
            onFetchOrders={handleFetchOrders}
          />
        </div>
        
        <FetchProgressBar 
          response={response} 
          isLoading={isLoading} 
          shouldContinueFetching={shouldContinueFetching} 
        />
        
        {transformStats.inputCount > 0 && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertTitle>Processing Information</AlertTitle>
            <AlertDescription>
              Processed {transformStats.inputCount} orders in {transformStats.elapsedTime}ms.
              {transformStats.uniqueCount < transformStats.transformedCount && (
                ` Found ${transformStats.transformedCount - transformStats.uniqueCount} duplicate orders.`
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {(rawData?.orders?.length > 0 || response) && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">
                Orders {response?.paginationProgress?.isComplete ? "(Complete)" : "(In Progress)"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === "with-completion" 
                  ? `Found ${rawData?.orders?.length || 0} orders with completion data out of ${orderCount} total orders`
                  : `Found ${orderCount} orders`
                }
              </p>
            </div>
            
            <div className="p-4">
              <Tabs defaultValue="raw">
                <TabsList className="mb-4">
                  <TabsTrigger value="raw">Raw Data Display</TabsTrigger>
                  <TabsTrigger value="transformed">Transformed Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="raw">
                  {renderRawOrdersTable()}
                </TabsContent>
                
                <TabsContent value="transformed">
                  <WorkOrderContent
                    workOrders={workOrders}
                    isLoading={isProcessing || shouldContinueFetching}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onStatusUpdate={updateWorkOrderStatus}
                    onImageView={openImageViewer}
                    onDelete={deleteWorkOrder}
                    onOptimoRouteSearch={handleOptimoRouteSearch}
                    statusCounts={statusCounts}
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
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BulkOrdersTest;
