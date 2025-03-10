
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PaginationState } from "../types";

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const Pagination = ({ 
  pagination,
  onPageChange,
  onPageSizeChange
}: PaginationProps) => {
  const { page, pageSize, total } = pagination;
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  
  // Ensure current page is not out of bounds
  const currentPage = Math.min(page, totalPages);
  
  // If the current page is different from the page prop, adjust it
  if (currentPage !== page && totalPages > 0) {
    // This will trigger a re-render with the correct page
    setTimeout(() => onPageChange(currentPage), 0);
  }
  
  // Calculate displayed page range
  const firstItem = total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total);
  const lastItem = Math.min(page * pageSize, total);
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-2 border-t">
      <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
        Showing <span className="font-medium">{firstItem}</span> to{" "}
        <span className="font-medium">{lastItem}</span> of{" "}
        <span className="font-medium">{total}</span> orders
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">Page</span>
            <span className="text-sm font-medium">{page}</span>
            <span className="text-sm text-muted-foreground">of {totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
