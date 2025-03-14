import { useState } from "react";
import { SortField, SortDirection, PaginationState, WorkOrderFilters } from "@/components/workorders/types";
import { useWorkOrderFetch } from "./useWorkOrderFetch";
import { useWorkOrderStatusCounts } from "./useWorkOrderStatusCounts";
import { useWorkOrderMutations } from "./useWorkOrderMutations";
import { useWorkOrderImport } from "./useWorkOrderImport";

export const useWorkOrderData = () => {
  const [filters, setFilters] = useState<WorkOrderFilters>({
    status: null,
    dateRange: { from: null, to: null },
    driver: null,
    location: null,
    orderNo: null
  });
  
  const [sortField, setSortField] = useState<SortField>('service_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0
  });

  const { data: workOrdersData = { data: [], total: 0 }, isLoading, refetch } = useWorkOrderFetch(
    filters, 
    pagination.page, 
    pagination.pageSize,
    sortField,
    sortDirection
  );
  
  const workOrders = workOrdersData.data;
  const total = workOrdersData.total;
  
  if (pagination.total !== total) {
    setPagination(prev => ({ ...prev, total }));
  }
  
  const statusCounts = useWorkOrderStatusCounts(workOrders, filters.status);
  
  const { searchOptimoRoute } = useWorkOrderImport();
  const { updateWorkOrderStatus, deleteWorkOrder } = useWorkOrderMutations();

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
    
    handlePageChange(1);
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
    
    handlePageChange(1);
  };

  const clearAllFilters = () => {
    setFilters({
      status: null,
      dateRange: { from: null, to: null },
      driver: null,
      location: null,
      orderNo: null
    });
    
    handlePageChange(1);
  };

  const openImageViewer = (workOrderId: string) => {
    console.log(`Opening images for work order: ${workOrderId}`);
  };

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    handlePageChange(1);
  };
  
  const handlePageChange = (page: number) => {
    const newPage = Math.max(1, page);
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };
  
  const handleFiltersChange = (newFilters: WorkOrderFilters) => {
    setFilters(newFilters);
    handlePageChange(1);
  };

  return {
    data: workOrders,
    isLoading,
    filters,
    setFilters: handleFiltersChange,
    onColumnFilterChange: handleColumnFilterChange,
    clearColumnFilter,
    clearAllFilters,
    searchOptimoRoute,
    updateWorkOrderStatus,
    openImageViewer,
    deleteWorkOrder,
    statusCounts,
    sortField,
    sortDirection,
    setSort: handleSort,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total
    },
    handlePageChange,
    handlePageSizeChange,
    refetch
  };
};
