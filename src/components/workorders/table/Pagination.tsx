
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PaginationState } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const Pagination = ({ pagination, onPageChange, onPageSizeChange }: PaginationProps) => {
  const { page, pageSize, total } = pagination;
  const totalPages = Math.ceil(total / pageSize);
  
  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(Number(value));
  };

  return (
    <div className="flex flex-col gap-2 p-3 mt-4 bg-white">
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-4">
          {/* Page size selector */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Rows:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-7 w-14 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              disabled={page <= 1}
              onClick={() => onPageChange(1)}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
              <span className="sr-only">First page</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="sr-only">Previous page</span>
            </Button>
            
            <span className="text-xs px-2 py-1.5 bg-gray-50 rounded-md min-w-16 text-center mx-2">
              {page} / {totalPages}
            </span>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="sr-only">Next page</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              disabled={page >= totalPages}
              onClick={() => onPageChange(totalPages)}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
