
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationState } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const Pagination = ({ pagination, onPageChange, onPageSizeChange }: PaginationProps) => {
  const isMobile = useIsMobile();
  
  const { page, pageSize, total } = pagination;
  const totalPages = Math.ceil(total / pageSize);
  
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    // Always show first page, last page, current page, and pages around current
    const pageNumbers: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      // If 7 or fewer pages, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always add first page
      pageNumbers.push(1);
      
      // Add ellipsis if needed
      if (page > 3) {
        pageNumbers.push('ellipsis');
      }
      
      // Add pages around current page
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed
      if (page < totalPages - 2) {
        pageNumbers.push('ellipsis');
      }
      
      // Add last page if we have more than 1 page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  
  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(Number(value));
  };

  return (
    <div className="flex flex-col gap-2 p-3 mt-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {total} {total === 1 ? 'item' : 'items'}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Page size selector - moved next to pagination buttons */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Rows:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-7 w-14 text-xs shadow-sm">
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
          
          <div className="flex items-center space-x-1.5">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 shadow-sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="sr-only">Previous page</span>
            </Button>
            
            {!isMobile && (
              <div className="flex items-center space-x-1.5 min-w-32 justify-center">
                {pageNumbers.map((pageNum, idx) => 
                  pageNum === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={`page-${pageNum}`}
                      variant={pageNum === page ? "default" : "outline"}
                      size="icon"
                      className="h-7 w-7 text-xs shadow-sm"
                      onClick={() => onPageChange(pageNum as number)}
                    >
                      {pageNum}
                    </Button>
                  )
                )}
              </div>
            )}
            
            {isMobile && (
              <span className="text-xs px-2 py-1.5 bg-gray-100 rounded-md min-w-16 text-center">
                {page} / {totalPages}
              </span>
            )}
            
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 shadow-sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
