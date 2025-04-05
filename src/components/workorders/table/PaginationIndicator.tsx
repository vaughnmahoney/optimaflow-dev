
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { PaginationState } from "../types";

interface PaginationIndicatorProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const PaginationIndicator = ({
  pagination,
  onPageChange,
  onRefresh,
  isRefreshing
}: PaginationIndicatorProps) => {
  const { page, pageSize, total } = pagination;
  
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  
  const hasPrevious = page > 1;
  const hasNext = end < total;
  
  // Handle going to previous page
  const handlePrevious = () => {
    if (hasPrevious) {
      onPageChange(page - 1);
    }
  };
  
  // Handle going to next page
  const handleNext = () => {
    if (hasNext) {
      onPageChange(page + 1);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    if (onRefresh && !isRefreshing) {
      onRefresh();
    }
  };

  return (
    <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
      <span className="whitespace-nowrap hidden sm:inline">
        {start}-{end} of {total}
      </span>
      
      <div className="flex items-center gap-1">
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-6 w-6"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span className="sr-only">Refresh</span>
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className="h-6 w-6"
        >
          <ChevronLeft size={14} />
          <span className="sr-only">Previous</span>
        </Button>
        
        <span className="font-medium">
          {page}/{Math.ceil(total / pageSize)}
        </span>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNext}
          disabled={!hasNext}
          className="h-6 w-6"
        >
          <ChevronRight size={14} />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  );
};
