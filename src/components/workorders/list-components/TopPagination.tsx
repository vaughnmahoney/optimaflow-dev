
import { PaginationIndicator } from "../table/PaginationIndicator";
import { PaginationState } from "../types";

interface TopPaginationProps {
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TopPagination = ({ 
  pagination, 
  onPageChange,
  onRefresh,
  isRefreshing
}: TopPaginationProps) => {
  if (!pagination || !onPageChange) return null;
  
  return (
    <div className="flex justify-between items-center">
      <PaginationIndicator 
        pagination={pagination}
        onPageChange={onPageChange}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};
