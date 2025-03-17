
import { PaginationState } from "@/components/workorders/types";

/**
 * Paginates an array of items
 */
export const paginateItems = <T>(
  items: T[],
  pagination: PaginationState
): T[] => {
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  return items.slice(
    startIndex, 
    startIndex + pagination.pageSize
  );
};

/**
 * Creates handlers for updating pagination state
 */
export const usePaginationHandlers = (
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
) => {
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };

  return { handlePageChange, handlePageSizeChange };
};
