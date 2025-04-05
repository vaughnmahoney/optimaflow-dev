
import { SearchBar } from "../search/SearchBar";
import { PaginationIndicator } from "../table/PaginationIndicator";
import { PaginationState } from "../types";

interface TopPaginationProps {
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

export const TopPagination = ({ 
  pagination, 
  onPageChange,
  onRefresh,
  isRefreshing,
  onSearchChange,
  searchValue
}: TopPaginationProps) => {
  if (!pagination || !onPageChange) return null;
  
  return (
    <div className="flex justify-end items-center w-full">
      <PaginationIndicator 
        pagination={pagination}
        onPageChange={onPageChange}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};
