
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TextFilter } from "./TextFilter";
import { DriverFilter } from "./DriverFilter";
import { LocationFilter } from "./LocationFilter";
import { DateFilter } from "./DateFilter";
import { StatusFilter } from "./StatusFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrderFilters, SortDirection } from "../types";
import { 
  ArrowDownAZ, 
  ArrowUpDown, 
  CalendarDays, 
  Factory, 
  FilterX, 
  PenSquare, 
  SortAsc,
  SortDesc,
  User
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AdvancedFiltersProps {
  filters: WorkOrderFilters;
  onColumnFilterChange: (column: string, value: any) => void;
  clearColumnFilter: (column: string) => void;
  clearAllFilters: () => void;
  sortDirection?: SortDirection;
  onSortDirectionChange?: (direction: SortDirection) => void;
}

export const AdvancedFilters = ({ 
  filters, 
  onColumnFilterChange, 
  clearColumnFilter, 
  clearAllFilters,
  sortDirection = 'desc',
  onSortDirectionChange
}: AdvancedFiltersProps) => {
  const [activeTab, setActiveTab] = useState("filters");

  // Check if any filter is active
  const hasActiveFilters = 
    filters.status !== null || 
    filters.orderNo !== null || 
    filters.driver !== null || 
    filters.location !== null || 
    filters.dateRange.from !== null || 
    filters.dateRange.to !== null;

  const handleSortDirectionChange = (value: string) => {
    if (onSortDirectionChange) {
      onSortDirectionChange(value as SortDirection);
    }
  };

  return (
    <div className="min-w-[240px]">
      <Tabs defaultValue="filters" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="filters" className="text-xs">
            <FilterX className="h-3.5 w-3.5 mr-1" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="sort" className="text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
            Sort
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="filters" className="space-y-3">
          <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
            <div className="space-y-2">
              <div className="flex items-center">
                <PenSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Order Number</span>
              </div>
              <TextFilter 
                value={filters.orderNo}
                onChange={(value) => onColumnFilterChange('order_no', value)}
                onClear={() => clearColumnFilter('order_no')}
                placeholder="Filter by order #"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Service Date</span>
              </div>
              <DateFilter
                column="service_date"
                value={filters.dateRange}
                onChange={(value) => onColumnFilterChange('service_date', value)}
                onClear={() => clearColumnFilter('service_date')}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Driver</span>
              </div>
              <DriverFilter
                value={filters.driver}
                onChange={(value) => onColumnFilterChange('driver', value)}
                onClear={() => clearColumnFilter('driver')}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Factory className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <LocationFilter
                value={filters.location}
                onChange={(value) => onColumnFilterChange('location', value)}
                onClear={() => clearColumnFilter('location')}
              />
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="w-full mt-4"
              >
                <FilterX className="h-3.5 w-3.5 mr-1" />
                Clear all filters
              </Button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="sort" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center mb-2">
              <ArrowDownAZ className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Sort Direction</span>
            </div>
            
            <RadioGroup 
              value={sortDirection} 
              onValueChange={handleSortDirectionChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="desc" id="sort-newest" />
                <Label htmlFor="sort-newest" className="flex items-center">
                  <SortDesc className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Newest first</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="asc" id="sort-oldest" />
                <Label htmlFor="sort-oldest" className="flex items-center">
                  <SortAsc className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Oldest first</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
