
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
    const pageNumbers: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Show ellipsis if current page is more than 3
      if (page > 3) {
        pageNumbers.push('ellipsis');
      }
      
      // Calculate range around current page
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);
      
      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Show ellipsis if current page is less than totalPages - 2
      if (page < totalPages - 2) {
        pageNumbers.push('ellipsis');
      }
      
      // Always show last page if more than 1 page
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
    <div className="flex flex-col gap-2 p-3 mt-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {total} {total === 1 ? 'item' : 'items'}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Page size selector - next to pagination buttons */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
          
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-3 gap-1 text-sm font-normal"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            
            {!isMobile && (
              <div className="flex items-center">
                {pageNumbers.map((pageNum, idx) => 
                  pageNum === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={`page-${pageNum}`}
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      className={`h-9 w-9 text-sm ${pageNum === page ? 'bg-primary text-primary-foreground' : 'bg-white'}`}
                      onClick={() => onPageChange(pageNum as number)}
                    >
                      {pageNum}
                    </Button>
                  )
                )}
              </div>
            )}
            
            {isMobile && (
              <span className="px-4 py-2 text-sm font-medium">
                {page} / {totalPages}
              </span>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 px-3 gap-1 text-sm font-normal"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
