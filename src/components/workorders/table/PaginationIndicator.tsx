
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { PaginationState } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAutoImport } from "@/hooks/useAutoImport";
import { Progress } from "@/components/ui/progress";

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
  const { runAutoImport, isImporting, importProgress } = useAutoImport();
  
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
    <div className="flex flex-col justify-between gap-2 py-2 px-3 mb-4 bg-white">
      {(isImporting || importProgress?.percentage > 0) && (
        <div className="w-full mb-2">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="font-medium text-blue-700">
              Importing orders: {importProgress?.percentage || 0}%
            </span>
            {importProgress?.current && importProgress?.total && (
              <span className="text-muted-foreground">
                {importProgress.current} of {importProgress.total}
              </span>
            )}
          </div>
          <Progress 
            value={importProgress?.percentage || 0} 
            className="h-1.5 bg-blue-100" 
          />
        </div>
      )}
      
      <div className="flex justify-between items-center">
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
    </div>
  );
};
