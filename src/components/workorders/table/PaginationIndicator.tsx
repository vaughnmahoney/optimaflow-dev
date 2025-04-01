
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationState } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaginationIndicatorProps {
  pagination: PaginationState;
  onPageChange?: (page: number) => void;
}

export const PaginationIndicator = ({ 
  pagination, 
  onPageChange 
}: PaginationIndicatorProps) => {
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

  if (!onPageChange || totalPages <= 1) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-xs text-muted-foreground">
        {total} {total === 1 ? 'item' : 'items'}
      </div>
      
      <div className="flex items-center space-x-1">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-6 w-6"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3 w-3" />
          <span className="sr-only">Previous page</span>
        </Button>
        
        {!isMobile && (
          <div className="flex items-center space-x-1">
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
                  className="h-6 w-6 text-xs"
                  onClick={() => onPageChange(pageNum as number)}
                >
                  {pageNum}
                </Button>
              )
            )}
          </div>
        )}
        
        {isMobile && (
          <span className="text-xs px-1">
            {page} / {totalPages}
          </span>
        )}
        
        <Button 
          variant="outline" 
          size="icon" 
          className="h-6 w-6"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-3 w-3" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
};
