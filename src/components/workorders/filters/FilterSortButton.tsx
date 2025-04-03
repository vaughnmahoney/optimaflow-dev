
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkOrderFilters, SortDirection, SortField } from "../types";
import { TextFilter, DateFilter, StatusFilter, DriverFilter, LocationFilter } from ".";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
  
  const hasActiveFilters = 
    filters.status !== null || 
    filters.orderNo !== null || 
    filters.driver !== null || 
    filters.location !== null || 
    filters.dateRange.from !== null || 
    filters.dateRange.to !== null ||
    filters.optimoRouteStatus !== null;

  const toggleDateSort = () => {
    // Toggle between oldest first (asc) and newest first (desc)
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    onSort('end_time', newDirection);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "flex items-center space-x-2 py-1.5 px-3 rounded-full transition-all shrink-0",
            "bg-white border border-gray-200 hover:border-gray-300 shadow-sm",
            hasActiveFilters ? 'bg-primary/10 border-primary/20' : ''
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-5 h-5 rounded-full",
            "bg-gray-200"
          )}>
            <SlidersHorizontal 
              size={14}
              className="text-gray-700" 
            />
          </div>
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[20px] bg-primary text-white">
              {countActiveFilters(filters)}
            </span>
          )}
        </button>
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
        
        {/* Wrap content in ScrollArea for scrollability */}
        <ScrollArea className="h-[calc(100vh-150px)] pr-4">
          <div className="space-y-4 pt-4">
            {/* Sort Section */}
            <div className="mb-2">
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
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">OptimoRoute Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.optimoRouteStatus === 'success' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onColumnFilterChange('optimoroute_status', filters.optimoRouteStatus === 'success' ? null : 'success')}
                    className="flex-1"
                  >
                    Success
                  </Button>
                  
                  <Button
                    variant={filters.optimoRouteStatus === 'failed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onColumnFilterChange('optimoroute_status', filters.optimoRouteStatus === 'failed' ? null : 'failed')}
                    className="flex-1"
                  >
                    Failed
                  </Button>
                  
                  <Button
                    variant={filters.optimoRouteStatus === 'rejected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onColumnFilterChange('optimoroute_status', filters.optimoRouteStatus === 'rejected' ? null : 'rejected')}
                    className="flex-1"
                  >
                    Rejected
                  </Button>
                </div>
                {filters.optimoRouteStatus !== null && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => clearColumnFilter('optimoroute_status')}
                    className="mt-1 h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            {/* Add padding at the bottom for better scrolling UX */}
            <div className="h-8"></div>
          </div>
        </ScrollArea>
        
        <div className="mt-4">
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
  if (filters.optimoRouteStatus) count++; // Count optimoRouteStatus as well
  return count;
};
