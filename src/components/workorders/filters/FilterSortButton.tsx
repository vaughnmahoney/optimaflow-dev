
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { WorkOrderFilters, SortDirection, SortField } from "../types";
import { FilterSortTrigger } from "./filter-sort/FilterSortTrigger";
import { FilterSortHeader } from "./filter-sort/FilterSortHeader";
import { FilterSortContent } from "./filter-sort/FilterSortContent";
import { checkHasActiveFilters } from "./filter-sort/filterUtils";

interface FilterSortButtonProps {
  filters: WorkOrderFilters;
  onColumnFilterChange: (column: string, value: any) => void;
  clearColumnFilter: (column: string) => void;
  clearAllFilters: () => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
}

export const FilterSortButton = ({
  filters,
  onColumnFilterChange,
  clearColumnFilter,
  clearAllFilters,
  sortField = 'end_time',
  sortDirection = 'desc',
  onSort = () => {},
}: FilterSortButtonProps) => {
  const [open, setOpen] = useState(false);
  // Create local states to track filter changes before applying them
  const [localFilters, setLocalFilters] = useState<WorkOrderFilters>(filters);
  
  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const hasActiveFilters = checkHasActiveFilters(filters);
  
  // Handler for local filter changes
  const handleLocalFilterChange = (column: string, value: any) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      
      switch (column) {
        case 'order_no':
          newFilters.orderNo = value;
          break;
        case 'service_date':
          newFilters.dateRange = value;
          break;
        case 'driver':
          newFilters.driver = value;
          break;
        case 'location':
          newFilters.location = value;
          break;
        case 'status':
          newFilters.status = value;
          break;
        case 'optimoroute_status':
          newFilters.optimoRouteStatus = value;
          break;
      }
      
      return newFilters;
    });
  };
  
  // Handler for local filter clearing
  const handleLocalFilterClear = (column: string) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      
      switch (column) {
        case 'order_no':
          newFilters.orderNo = null;
          break;
        case 'service_date':
          newFilters.dateRange = { from: null, to: null };
          break;
        case 'driver':
          newFilters.driver = null;
          break;
        case 'location':
          newFilters.location = null;
          break;
        case 'status':
          newFilters.status = null;
          break;
        case 'optimoroute_status':
          newFilters.optimoRouteStatus = null;
          break;
      }
      
      return newFilters;
    });
  };
  
  // Apply all filters at once
  const applyAllFilters = () => {
    // Apply all changes from localFilters to the parent component
    Object.entries(localFilters).forEach(([key, value]) => {
      switch(key) {
        case 'orderNo':
          onColumnFilterChange('order_no', value);
          break;
        case 'dateRange':
          onColumnFilterChange('service_date', value);
          break;
        case 'driver':
          onColumnFilterChange('driver', value);
          break;
        case 'location':
          onColumnFilterChange('location', value);
          break;
        case 'status':
          onColumnFilterChange('status', value);
          break;
        case 'optimoRouteStatus':
          onColumnFilterChange('optimoroute_status', value);
          break;
      }
    });
    setOpen(false);
  };

  const handleClearAll = () => {
    clearAllFilters();
    setLocalFilters({
      status: null,
      dateRange: { from: null, to: null },
      driver: null,
      location: null,
      orderNo: null,
      optimoRouteStatus: null
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <FilterSortTrigger filters={filters} />
      
      <SheetContent side="right" className="w-full sm:w-[450px]">
        <FilterSortHeader 
          hasActiveFilters={hasActiveFilters} 
          onClearAll={handleClearAll} 
        />
        
        <FilterSortContent 
          localFilters={localFilters}
          handleLocalFilterChange={handleLocalFilterChange}
          handleLocalFilterClear={handleLocalFilterClear}
          sortDirection={sortDirection}
          onSort={onSort}
          applyAllFilters={applyAllFilters}
          setOpen={setOpen}
        />
      </SheetContent>
    </Sheet>
  );
};
