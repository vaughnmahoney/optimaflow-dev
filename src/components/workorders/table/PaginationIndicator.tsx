
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { PaginationState } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAutoImport } from "@/hooks/useAutoImport";

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
  isRefreshing = false
}: PaginationIndicatorProps) => {
  const { page, pageSize, total } = pagination;
  const totalPages = Math.ceil(total / pageSize);
  const isMobile = useIsMobile();
  const { runAutoImport, isImporting } = useAutoImport();
  
  // Combined function to handle both refresh and auto-import
  const handleRefreshAndImport = async () => {
    if (isRefreshing || isImporting) return;
    
    // First refresh the current data if a refresh handler is provided
    if (onRefresh) {
      await onRefresh();
    }
    
    // Then run the auto-import to check for new orders
    await runAutoImport();
  };
  
  if (total === 0) {
    return null;
  }

  return (
    <div className="flex justify-between items-center py-2 px-3 mb-4 bg-white">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{total} {total === 1 ? 'order' : 'orders'}</span>
        
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6 p-0.5"
            onClick={handleRefreshAndImport}
            disabled={isRefreshing || isImporting}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing || isImporting ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh & Import</span>
          </Button>
        )}
      </div>

      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-7 w-7 shadow-sm ml-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="sr-only">Previous page</span>
        </Button>
        
        <span className="text-xs px-2 py-1.5 bg-gray-100 rounded-md min-w-16 text-center mx-2">
          {page} / {totalPages}
        </span>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="h-7 w-7 shadow-sm mr-1"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
};
