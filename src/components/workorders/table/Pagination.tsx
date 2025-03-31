
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
  
  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(Number(value));
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row'} items-center justify-between p-2 border-t bg-muted/20`}>
      {/* Page size selector */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span className="hidden sm:inline-block">Rows per page:</span>
        <span className="inline-block sm:hidden">Per page:</span>
        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-8 w-16">
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
      
      {/* Page navigation */}
      <div className="flex items-center space-x-2">
        <div className="text-sm text-muted-foreground mr-2">
          {`${page} of ${totalPages}`}
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
