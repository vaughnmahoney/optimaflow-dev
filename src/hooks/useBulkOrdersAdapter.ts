
import { useState } from "react";
import { useBulkOrdersFetch } from "./useBulkOrdersFetch";
import { useOrderTransformation } from "./bulk-orders/useOrderTransformation";
import { useAdapterStatusManager } from "./bulk-orders/useAdapterStatusManager";
import { useAdapterFilters } from "./bulk-orders/useAdapterFilters";
import { useAdapterSortAndPagination } from "./bulk-orders/useAdapterSortAndPagination";

/**
 * This hook adapts bulk order data to the work order component format
 * It serves as a bridge between the bulk order API and the work order UI
 */
export const useBulkOrdersAdapter = () => {
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
  
  // Transform raw orders into work order format
  const { workOrders, setWorkOrders } = useOrderTransformation(rawOrders);
  
  // Status management
  const { 
    statusCounts, 
    updateWorkOrderStatus,
    deleteWorkOrder 
  } = useAdapterStatusManager(workOrders);
  
  // Filter handling
  const {
    filters,
    setFilters,
    onColumnFilterChange,
    clearColumnFilter,
    clearAllFilters
  } = useAdapterFilters();
  
  // Sort and pagination
  const {
    sortField,
    sortDirection,
    setSort,
    pagination,
    handlePageChange,
    handlePageSizeChange
  } = useAdapterSortAndPagination(workOrders.length);
  
  // Simple utility functions
  const openImageViewer = (workOrderId: string) => {
    // Implementation handled by the WorkOrderList component
    console.log("Opening image viewer for:", workOrderId);
  };
  
  // Adapter for updateWorkOrderStatus
  const handleUpdateWorkOrderStatus = (workOrderId: string, newStatus: string) => {
    updateWorkOrderStatus(setWorkOrders, workOrderId, newStatus);
  };
  
  // Adapter for deleteWorkOrder
  const handleDeleteWorkOrder = (workOrderId: string) => {
    deleteWorkOrder(setWorkOrders, workOrderId);
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
    setFilters,
    onColumnFilterChange,
    clearColumnFilter,
    clearAllFilters,
    updateWorkOrderStatus: handleUpdateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder: handleDeleteWorkOrder,
    statusCounts,
    sortField,
    sortDirection,
    setSort,
    pagination,
    handlePageChange,
    handlePageSizeChange
  };
};
