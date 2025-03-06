
import { useState, useEffect } from "react";
import { WorkOrder, SortDirection, SortField, PaginationState, WorkOrderFilters } from "@/components/workorders/types";
import { useBulkOrdersFetch } from "./useBulkOrdersFetch";
import { toast } from "sonner";

/**
 * This hook adapts bulk order data to the work order component format
 * It serves as a bridge between the bulk order API and the work order UI
 */
export const useBulkOrdersAdapter = () => {
  // Initialize with default filters matching the WorkOrderFilters type
  const [filters, setFilters] = useState<WorkOrderFilters>({
    status: null,
    dateRange: { from: null, to: null },
    driver: null,
    location: null,
    orderNo: null
  });
  
  // Use the existing bulk orders fetch hook
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
    handleFetchOrders
  } = useBulkOrdersFetch();
  
  // State for work order component compatibility
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [statusCounts, setStatusCounts] = useState({
    approved: 0,
    pending_review: 0,
    flagged: 0,
    all: 0
  });
  
  // Set up sort and pagination for compatibility with work order components
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0
  });

  // Transform bulk orders to work order format when rawOrders changes
  useEffect(() => {
    if (rawOrders && rawOrders.length > 0) {
      const transformedOrders: WorkOrder[] = rawOrders.map((order, index) => {
        // Extract order number from different possible locations
        const orderNo = order.data?.orderNo || 
                       order.orderNo || 
                       (order.completionDetails && order.completionDetails.orderNo) ||
                       `BULK-${index}`;
        
        // Extract service date
        const serviceDate = order.data?.date ||
                           order.service_date || 
                           (order.searchResponse && order.searchResponse.data && order.searchResponse.data.date) ||
                           new Date().toISOString();
        
        // Extract driver information
        const driverName = order.driver?.name || 
                          (order.scheduleInformation && order.scheduleInformation.driverName) ||
                          (order.searchResponse?.scheduleInformation?.driverName) ||
                          "Unknown Driver";
        
        // Extract location information
        const location = order.location || 
                        (order.searchResponse && order.searchResponse.data && order.searchResponse.data.location) ||
                        { name: "Unknown Location" };
        
        // Determine status - default to pending_review for new imports
        const status = order.status || 
                      order.completion_status ||
                      (order.completionDetails?.data?.status) || 
                      "pending_review";
                      
        // Get completion response data
        const completionResponse = {
          success: true,
          orders: [{
            id: orderNo,
            data: {
              form: {
                images: order.completionDetails?.data?.form?.images || [],
                note: order.completionDetails?.data?.form?.note || ""
              },
              startTime: order.completionDetails?.data?.startTime,
              endTime: order.completionDetails?.data?.endTime,
              tracking_url: order.completionDetails?.data?.tracking_url
            }
          }]
        };
                      
        // Create a work order object from the bulk order data
        return {
          id: order.id || `bulk-order-${index}`,
          order_no: orderNo,
          status: status,
          timestamp: new Date().toISOString(),
          service_date: serviceDate,
          service_notes: order.service_notes || "",
          notes: order.notes || "",
          location: location,
          driver: { name: driverName },
          has_images: (order.completionDetails?.data?.form?.images?.length || 0) > 0,
          completion_response: completionResponse,
          search_response: order.searchResponse || null
        };
      });
      
      setWorkOrders(transformedOrders);
      setPagination(prev => ({ ...prev, total: transformedOrders.length }));
      
      // Calculate status counts
      const counts = transformedOrders.reduce((acc, order) => {
        const status = order.status || "pending_review";
        if (status === "approved") acc.approved++;
        else if (status === "flagged") acc.flagged++;
        else if (status === "pending_review") acc.pending_review++;
        return acc;
      }, { approved: 0, pending_review: 0, flagged: 0, all: transformedOrders.length });
      
      setStatusCounts(counts);
    } else {
      setWorkOrders([]);
      setStatusCounts({ approved: 0, pending_review: 0, flagged: 0, all: 0 });
    }
  }, [rawOrders]);
  
  // Mock functions for compatibility with work order components
  const updateWorkOrderStatus = (workOrderId: string, newStatus: string) => {
    // Update in local state since this is just for the bulk processing view
    setWorkOrders(prev => 
      prev.map(wo => wo.id === workOrderId 
        ? { ...wo, status: newStatus } 
        : wo
      )
    );
    
    toast.success(`Status updated to ${newStatus}`);
    
    // Also update status counts
    setStatusCounts(prev => {
      const newCounts = { ...prev };
      
      // Find the order to update
      const order = workOrders.find(wo => wo.id === workOrderId);
      if (order) {
        // Decrement old status count
        const oldStatus = order.status || "pending_review";
        if (oldStatus === "approved") newCounts.approved--;
        else if (oldStatus === "flagged") newCounts.flagged--;
        else if (oldStatus === "pending_review") newCounts.pending_review--;
        
        // Increment new status count
        if (newStatus === "approved") newCounts.approved++;
        else if (newStatus === "flagged") newCounts.flagged++;
        else if (newStatus === "pending_review") newCounts.pending_review++;
      }
      
      return newCounts;
    });
  };
  
  const deleteWorkOrder = (workOrderId: string) => {
    // Just remove from local state
    setWorkOrders(prev => prev.filter(wo => wo.id !== workOrderId));
    toast.success("Work order removed from view");
    
    // Update status counts
    const orderToDelete = workOrders.find(wo => wo.id === workOrderId);
    if (orderToDelete) {
      setStatusCounts(prev => {
        const newCounts = { ...prev };
        const status = orderToDelete.status || "pending_review";
        if (status === "approved") newCounts.approved--;
        else if (status === "flagged") newCounts.flagged--;
        else if (status === "pending_review") newCounts.pending_review--;
        newCounts.all--;
        return newCounts;
      });
    }
  };
  
  const openImageViewer = (workOrderId: string) => {
    // Implementation handled by the WorkOrderList component
    console.log("Opening image viewer for:", workOrderId);
  };
  
  // Filter handling functions
  const handleFiltersChange = (newFilters: WorkOrderFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handleColumnFilterChange = (column: string, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (column) {
        case 'order_no':
          newFilters.orderNo = value;
          break;
        case 'service_date':
          newFilters.dateRange = value;
          break;
        case 'driver':
          newFilters.driver = value;
          break;
        case 'location':
          newFilters.location = value;
          break;
        case 'status':
          newFilters.status = value;
          break;
      }
      
      return newFilters;
    });
    
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const clearColumnFilter = (column: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (column) {
        case 'order_no':
          newFilters.orderNo = null;
          break;
        case 'service_date':
          newFilters.dateRange = { from: null, to: null };
          break;
        case 'driver':
          newFilters.driver = null;
          break;
        case 'location':
          newFilters.location = null;
          break;
        case 'status':
          newFilters.status = null;
          break;
      }
      
      return newFilters;
    });
  };
  
  const clearAllFilters = () => {
    setFilters({
      status: null,
      dateRange: { from: null, to: null },
      driver: null,
      location: null,
      orderNo: null
    });
  };
  
  // Pagination and sort functions
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize }));
  };
  
  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };
  
  // Return the adapted interface for work order components
  return {
    // Bulk order specific properties
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    activeTab,
    setActiveTab,
    handleFetchOrders,
    dataFlowLogging,
    originalData: {
      response,
      rawData,
      rawOrders
    },
    
    // Work order component compatible properties
    data: workOrders,
    isLoading,
    filters,
    setFilters: handleFiltersChange,
    onColumnFilterChange: handleColumnFilterChange,
    clearColumnFilter,
    clearAllFilters,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder,
    statusCounts,
    sortField,
    sortDirection,
    setSort: handleSort,
    pagination,
    handlePageChange,
    handlePageSizeChange
  };
};
