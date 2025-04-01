
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";
import { AdvancedFilters } from "./AdvancedFilters";
import { WorkOrderFilters, SortDirection } from "../types";

interface FilterSortButtonProps {
  filters: WorkOrderFilters;
  onColumnFilterChange: (column: string, value: any) => void;
  clearColumnFilter: (column: string) => void;
  clearAllFilters: () => void;
  sortDirection?: SortDirection;
  onSortDirectionChange?: (direction: SortDirection) => void;
}

export const FilterSortButton = ({
  filters,
  onColumnFilterChange,
  clearColumnFilter,
  clearAllFilters,
  sortDirection,
  onSortDirectionChange
}: FilterSortButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Check if any filter is active to show indicator
  const hasActiveFilters = 
    filters.status !== null || 
    filters.orderNo !== null || 
    filters.driver !== null || 
    filters.location !== null || 
    filters.dateRange.from !== null || 
    filters.dateRange.to !== null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <SlidersHorizontal className="h-4 w-4 mr-1" />
          <span>Filters & Sort</span>
          {hasActiveFilters && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <AdvancedFilters
          filters={filters}
          onColumnFilterChange={onColumnFilterChange}
          clearColumnFilter={clearColumnFilter}
          clearAllFilters={clearAllFilters}
          sortDirection={sortDirection}
          onSortDirectionChange={onSortDirectionChange}
        />
      </PopoverContent>
    </Popover>
  );
};
