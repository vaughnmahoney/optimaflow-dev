
import { useState } from "react";
import { SortDirection, SortField, PaginationState } from "@/components/workorders/types";

/**
 * Hook to manage sorting and pagination for bulk order adapter
 */
export const useAdapterSortAndPagination = (totalItems: number = 0) => {
  // Set up sort state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Set up pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: totalItems
  });

  // Update pagination when total items changes
  if (pagination.total !== totalItems) {
    setPagination(prev => ({ ...prev, total: totalItems }));
  }
  
  // Pagination functions
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize }));
  };
  
  // Sort function
  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  return {
    sortField,
    sortDirection,
    setSort: handleSort,
    pagination,
    handlePageChange,
    handlePageSizeChange
  };
};
