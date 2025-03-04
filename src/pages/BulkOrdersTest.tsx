
import { BulkOrdersForm } from "@/components/bulk-orders/BulkOrdersForm";
import { FetchProgressBar } from "@/components/bulk-orders/FetchProgressBar";
import { useBulkOrdersFetch } from "@/hooks/useBulkOrdersFetch";
import { Layout } from "@/components/Layout";
import { WorkOrderContent } from "@/components/workorders/WorkOrderContent";
import { useBulkOrderWorkOrders } from "@/hooks/useBulkOrderWorkOrders";
import { SortDirection, SortField } from "@/components/workorders/types";

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
  } = useBulkOrderWorkOrders(transformedOrders, isLoading || shouldContinueFetching);
  
  console.log("BulkOrdersTest: transformedOrders.length =", transformedOrders.length);
  console.log("BulkOrdersTest: filtered workOrders.length =", workOrders.length);
  
  const orderCount = response?.totalCount || transformedOrders.length;
  const filteredCount = response?.filteredCount || 0;

  // Placeholder function since we don't need OptimoRoute search in the bulk view
  const handleOptimoRouteSearch = (value: string) => {
    console.log('OptimoRoute search not implemented in bulk view:', value);
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
            
            <div className="p-4">
              <WorkOrderContent
                workOrders={workOrders}
                isLoading={isLoading || shouldContinueFetching}
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
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BulkOrdersTest;
