
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X, ArrowUp, ArrowDown } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WorkOrderFilters, SortDirection } from "../types";
import { TextFilter, DateFilter, StatusFilter, DriverFilter, LocationFilter } from ".";
import { Separator } from "@/components/ui/separator";

interface FilterSortButtonProps {
  filters: WorkOrderFilters;
  onColumnFilterChange: (column: string, value: any) => void;
  clearColumnFilter: (column: string) => void;
  clearAllFilters: () => void;
  sortField?: string;
  sortDirection?: SortDirection;
  onSort?: (field: string, direction: SortDirection) => void;
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
  
  const hasActiveFilters = 
    filters.status !== null || 
    filters.orderNo !== null || 
    filters.driver !== null || 
    filters.location !== null || 
    filters.dateRange.from !== null || 
    filters.dateRange.to !== null;

  const toggleDateSort = () => {
    // Toggle between oldest first (asc) and newest first (desc)
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    onSort('end_time', newDirection);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${hasActiveFilters ? 'bg-primary/10' : ''}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {countActiveFilters(filters)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[450px]">
        <SheetHeader>
          <SheetTitle>Filters & Sort</SheetTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Refine your work order view</p>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  clearAllFilters();
                  setOpen(false);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>
        
        {/* Sort Section */}
        <div className="mt-6 mb-2">
          <h3 className="text-sm font-medium">Sort Orders</h3>
          <div className="mt-2">
            <Button 
              variant="outline"
              className="w-full justify-start"
              onClick={toggleDateSort}
            >
              {sortDirection === 'asc' ? (
                <>
                  <ArrowUp className="h-4 w-4 mr-2" />
                  <span>Showing oldest first</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  <span>Showing newest first</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Order #</h3>
            <TextFilter 
              column="order_no" 
              value={filters.orderNo} 
              onChange={(value) => onColumnFilterChange('order_no', value)}
              onClear={() => clearColumnFilter('order_no')}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Date Range</h3>
            <DateFilter 
              column="service_date" 
              value={filters.dateRange} 
              onChange={(value) => onColumnFilterChange('service_date', value)}
              onClear={() => clearColumnFilter('service_date')}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Driver</h3>
            <DriverFilter 
              column="driver" 
              value={filters.driver} 
              onChange={(value) => onColumnFilterChange('driver', value)}
              onClear={() => clearColumnFilter('driver')}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Location</h3>
            <LocationFilter 
              column="location" 
              value={filters.location} 
              onChange={(value) => onColumnFilterChange('location', value)}
              onClear={() => clearColumnFilter('location')}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Status</h3>
            <StatusFilter 
              column="status" 
              value={filters.status} 
              onChange={(value) => onColumnFilterChange('status', value)}
              onClear={() => clearColumnFilter('status')}
            />
          </div>
        </div>
        
        <div className="mt-6">
          <SheetClose asChild>
            <Button className="w-full">Apply Filters</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Helper function to count active filters
const countActiveFilters = (filters: WorkOrderFilters): number => {
  let count = 0;
  if (filters.status) count++;
  if (filters.orderNo) count++;
  if (filters.driver) count++;
  if (filters.location) count++;
  if (filters.dateRange.from || filters.dateRange.to) count++;
  return count;
};
