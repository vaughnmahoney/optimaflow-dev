
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationState } from "../types";

interface PaginationIndicatorProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

export const PaginationIndicator = ({ pagination, onPageChange }: PaginationIndicatorProps) => {
  const { page, pageSize, total } = pagination;
  const totalPages = Math.ceil(total / pageSize);
  
  // Calculate which page numbers to show - must match Pagination component
  const getPageNumbers = () => {
    const pageNumbers: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Add ellipsis if current page is far from start
      if (page > 3) {
        pageNumbers.push('ellipsis');
      }
      
      // Show pages around current page
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if current page is far from end
      if (page < totalPages - 2) {
        pageNumbers.push('ellipsis');
      }
      
      // Always show last page if we have more than 1 page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex justify-between items-center py-2 px-3 mb-4 bg-white">
      <div className="text-xs text-muted-foreground">
        {total} {total === 1 ? 'item' : 'items'}
      </div>

      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-7 w-7 shadow-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        
        <div className="flex items-center space-x-1.5 px-3 min-w-32 justify-center">
          {pageNumbers.map((pageNum, idx) => 
            pageNum === 'ellipsis' ? (
              <span key={`ellipsis-top-${idx}`} className="px-1 text-xs text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={`page-top-${pageNum}`}
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
        
        <Button 
          variant="outline" 
          size="icon" 
          className="h-7 w-7 shadow-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
