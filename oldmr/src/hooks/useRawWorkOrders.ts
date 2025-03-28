
import { useState, useEffect } from "react";
import { useBulkOrdersFetch } from "./useBulkOrdersFetch";
import { PaginationState, WorkOrderFilters } from "@/components/workorders/types";

export const useRawWorkOrders = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    rawOrders,
    activeTab,
    setActiveTab,
    handleFetchOrders
  } = useBulkOrdersFetch();

  const [filters, setFilters] = useState<WorkOrderFilters>({
    status: null,
    dateRange: { from: null, to: null },
    driver: null,
    location: null,
    orderNo: null
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
    total: 0
  });

  // Set default dates if not set
  useEffect(() => {
    if (!startDate) {
      const defaultStart = new Date();
      defaultStart.setDate(defaultStart.getDate() - 7); // 7 days ago
      setStartDate(defaultStart);
    }
    
    if (!endDate) {
      setEndDate(new Date()); // Today
    }
  }, []);

  // Update pagination total when raw orders change
  useEffect(() => {
    if (rawOrders) {
      setPagination(prev => ({ ...prev, total: rawOrders.length }));
    }
  }, [rawOrders]);

  // Get paginated orders
  const getPaginatedOrders = () => {
    if (!rawOrders) return [];
    
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    
    return rawOrders.slice(start, end);
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    rawOrders,
    paginatedOrders: getPaginatedOrders(),
    activeTab,
    setActiveTab,
    handleFetchOrders,
    filters,
    setFilters,
    pagination,
    setPagination,
    handlePageChange: (page: number) => setPagination(prev => ({ ...prev, page })),
    handlePageSizeChange: (pageSize: number) => setPagination(prev => ({ ...prev, pageSize, page: 1 }))
  };
};
