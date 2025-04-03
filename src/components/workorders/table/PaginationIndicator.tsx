
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { PaginationState } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface PaginationIndicatorProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onRefresh?: () => Promise<any>;
}

export const PaginationIndicator = ({ pagination, onPageChange, onRefresh }: PaginationIndicatorProps) => {
  const { page, pageSize, total } = pagination;
  const totalPages = Math.ceil(total / pageSize);
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  if (total === 0) {
    return null;
  }

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex justify-between items-center py-2 px-3 mb-4 bg-white">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{total} orders</span>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-5 w-5 p-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
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
