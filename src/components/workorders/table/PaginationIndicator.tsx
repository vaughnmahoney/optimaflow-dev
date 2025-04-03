
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

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex justify-between items-center py-3 px-4 mb-4 border rounded-lg bg-white shadow-sm">
      <div className="text-xs text-muted-foreground">
        {total} {total === 1 ? 'item' : 'items'}
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
  );
};
