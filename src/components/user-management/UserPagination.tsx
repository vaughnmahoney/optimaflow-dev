
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserPaginationProps {
  currentPage: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const UserPagination = ({
  currentPage,
  pageCount,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: UserPaginationProps) => {
  const [pageSizeValue, setPageSizeValue] = useState(pageSize.toString());

  const handlePageSizeChange = (value: string) => {
    setPageSizeValue(value);
    onPageSizeChange(parseInt(value));
  };

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  const buildPageNumbers = () => {
    const MAX_VISIBLE_PAGES = 5;
    const pages = [];
    
    if (pageCount <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // Separator
        pages.push(pageCount);
      } else if (currentPage >= pageCount - 2) {
        pages.push(1);
        pages.push(-1); // Separator
        for (let i = pageCount - 3; i <= pageCount; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // Separator
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Separator
        pages.push(pageCount);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between p-4 border-t">
      <div className="flex-1 text-sm text-muted-foreground">
        {total > 0 ? `Showing ${start} to ${end} of ${total} users` : "No users found"}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={pageSizeValue}
            onValueChange={handlePageSizeChange}
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
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center text-sm font-medium">
            {buildPageNumbers().map((page, i) => 
              page === -1 ? (
                <span key={`ellipsis-${i}`} className="px-2">...</span>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={currentPage === page ? "default" : "outline"}
                  className="h-8 w-8 p-0 mx-0.5"
                  onClick={() => onPageChange(page)}
                  disabled={currentPage === page}
                >
                  {page}
                </Button>
              )
            )}
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pageCount || pageCount === 0}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageCount)}
            disabled={currentPage === pageCount || pageCount === 0}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
