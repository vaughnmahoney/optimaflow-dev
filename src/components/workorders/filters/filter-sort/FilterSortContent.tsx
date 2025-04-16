
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { WorkOrderFilters, SortDirection, SortField } from "../../types";
import { TextFilter, DateFilter, DriverFilter, LocationFilter, StatusFilter } from "../index";
import { FilterSectionContainer } from "./FilterSectionContainer";
import { SortControl } from "./SortControl";
import { OptimRouteStatusFilter } from "./OptimRouteStatusFilter";
import { X } from "lucide-react";

interface FilterSortContentProps {
  localFilters: WorkOrderFilters;
  handleLocalFilterChange: (column: string, value: any) => void;
  handleLocalFilterClear: (column: string) => void;
  sortDirection: SortDirection;
  onSort: (field: SortField, direction: SortDirection) => void;
  applyAllFilters: () => void;
  setOpen: (value: boolean) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export const FilterSortContent = ({
  localFilters,
  handleLocalFilterChange,
  handleLocalFilterClear,
  sortDirection,
  onSort,
  applyAllFilters,
  hasActiveFilters,
  onClearAll
}: FilterSortContentProps) => {
  return (
    <>
      {/* Wrap content in ScrollArea for scrollability */}
      <ScrollArea className="h-[calc(100vh-140px)] pr-3">
        <div className="space-y-3">
          {/* Sort Section */}
          <SortControl 
            sortDirection={sortDirection} 
            onSort={onSort} 
          />
          
          <Separator className="my-3" />
          
          <div className="space-y-4">
            <FilterSectionContainer title="Order #">
              <TextFilter 
                column="order_no" 
                value={localFilters.orderNo} 
                onChange={(value) => handleLocalFilterChange('order_no', value)}
                onClear={() => handleLocalFilterClear('order_no')}
              />
            </FilterSectionContainer>
            
            <FilterSectionContainer title="Date Range">
              <DateFilter 
                column="service_date" 
                value={localFilters.dateRange} 
                onChange={(value) => handleLocalFilterChange('service_date', value)}
                onClear={() => handleLocalFilterClear('service_date')}
              />
            </FilterSectionContainer>
            
            <FilterSectionContainer title="Driver">
              <DriverFilter 
                column="driver" 
                value={localFilters.driver} 
                onChange={(value) => handleLocalFilterChange('driver', value)}
                onClear={() => handleLocalFilterClear('driver')}
              />
            </FilterSectionContainer>
            
            <FilterSectionContainer title="Location">
              <LocationFilter 
                column="location" 
                value={localFilters.location} 
                onChange={(value) => handleLocalFilterChange('location', value)}
                onClear={() => handleLocalFilterClear('location')}
              />
            </FilterSectionContainer>
            
            <FilterSectionContainer title="Status">
              <StatusFilter 
                column="status" 
                value={localFilters.status} 
                onChange={(value) => handleLocalFilterChange('status', value)}
                onClear={() => handleLocalFilterClear('status')}
              />
            </FilterSectionContainer>
            
            <FilterSectionContainer title="OptimoRoute Status">
              <OptimRouteStatusFilter
                value={localFilters.optimoRouteStatus}
                onChange={(value) => handleLocalFilterChange('optimoroute_status', value)}
                onClear={() => handleLocalFilterClear('optimoroute_status')}
              />
            </FilterSectionContainer>
          </div>
          
          {/* Add padding at the bottom for better scrolling UX */}
          <div className="h-4"></div>
        </div>
      </ScrollArea>
      
      <div className="mt-2 sticky bottom-0 pt-2 border-t">
        <div className="flex gap-2 justify-between">
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearAll}
              className="h-9 text-sm"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear All
            </Button>
          )}
          
          <Button 
            className={`h-9 text-sm ${hasActiveFilters ? 'flex-1' : 'w-full'}`}
            onClick={applyAllFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
};
