
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortDirection, SortField } from "../types";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextFilter, DateFilter, StatusFilter, DriverFilter, LocationFilter } from "../filters/ColumnFilters";
import { Badge } from "@/components/ui/badge";

interface WorkOrderTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  filters: {
    orderNo: string | null;
    dateRange: { from: Date | null; to: Date | null };
    driver: string | null;
    location: string | null;
    status: string | null;
  };
  onFilterChange: (column: string, value: any) => void;
  onFilterClear: (column: string) => void;
}

export const WorkOrderTableHeader = ({ 
  sortField, 
  sortDirection, 
  onSort,
  filters,
  onFilterChange,
  onFilterClear
}: WorkOrderTableHeaderProps) => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  
  const handleFilterChange = (column: string, value: any) => {
    onFilterChange(column, value);
    setOpenPopover(null); // Close popover after applying filter
  };
  
  const isFiltered = (column: string) => {
    switch(column) {
      case 'order_no':
        return !!filters.orderNo;
      case 'service_date':
        return !!(filters.dateRange.from || filters.dateRange.to);
      case 'driver':
        return !!filters.driver;
      case 'location':
        return !!filters.location;
      case 'status':
        return !!filters.status;
      default:
        return false;
    }
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          sortable
          sortDirection={sortField === 'order_no' ? sortDirection : null}
          onSort={() => onSort('order_no')}
          className="relative"
        >
          <div className="flex items-center">
            <span>Order #</span>
            <Popover open={openPopover === 'order_no'} onOpenChange={(open) => setOpenPopover(open ? 'order_no' : null)}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 ml-1 ${isFiltered('order_no') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Filter className="h-3 w-3" />
                  {isFiltered('order_no') && (
                    <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0" align="start">
                <TextFilter 
                  column="order_no" 
                  value={filters.orderNo} 
                  onChange={(value) => handleFilterChange('order_no', value)}
                  onClear={() => onFilterClear('order_no')}
                />
              </PopoverContent>
            </Popover>
          </div>
        </TableHead>
        
        <TableHead 
          sortable
          sortDirection={sortField === 'service_date' ? sortDirection : null}
          onSort={() => onSort('service_date')}
          className="relative"
        >
          <div className="flex items-center">
            <span>Service Date</span>
            <Popover open={openPopover === 'service_date'} onOpenChange={(open) => setOpenPopover(open ? 'service_date' : null)}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 ml-1 ${isFiltered('service_date') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Filter className="h-3 w-3" />
                  {isFiltered('service_date') && (
                    <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DateFilter 
                  column="service_date" 
                  value={filters.dateRange} 
                  onChange={(value) => handleFilterChange('service_date', value)}
                  onClear={() => onFilterClear('service_date')}
                />
              </PopoverContent>
            </Popover>
          </div>
        </TableHead>
        
        <TableHead 
          sortable
          sortDirection={sortField === 'driver' ? sortDirection : null}
          onSort={() => onSort('driver')}
          className="relative"
        >
          <div className="flex items-center">
            <span>Driver</span>
            <Popover open={openPopover === 'driver'} onOpenChange={(open) => setOpenPopover(open ? 'driver' : null)}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 ml-1 ${isFiltered('driver') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Filter className="h-3 w-3" />
                  {isFiltered('driver') && (
                    <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0" align="start">
                <DriverFilter 
                  column="driver" 
                  value={filters.driver} 
                  onChange={(value) => handleFilterChange('driver', value)}
                  onClear={() => onFilterClear('driver')}
                />
              </PopoverContent>
            </Popover>
          </div>
        </TableHead>
        
        <TableHead 
          sortable
          sortDirection={sortField === 'location' ? sortDirection : null}
          onSort={() => onSort('location')}
          className="relative"
        >
          <div className="flex items-center">
            <span>Location</span>
            <Popover open={openPopover === 'location'} onOpenChange={(open) => setOpenPopover(open ? 'location' : null)}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 ml-1 ${isFiltered('location') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Filter className="h-3 w-3" />
                  {isFiltered('location') && (
                    <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0" align="start">
                <LocationFilter 
                  column="location" 
                  value={filters.location} 
                  onChange={(value) => handleFilterChange('location', value)}
                  onClear={() => onFilterClear('location')}
                />
              </PopoverContent>
            </Popover>
          </div>
        </TableHead>
        
        <TableHead 
          sortable
          sortDirection={sortField === 'status' ? sortDirection : null}
          onSort={() => onSort('status')}
          className="relative"
        >
          <div className="flex items-center">
            <span>Status</span>
            <Popover open={openPopover === 'status'} onOpenChange={(open) => setOpenPopover(open ? 'status' : null)}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 ml-1 ${isFiltered('status') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Filter className="h-3 w-3" />
                  {isFiltered('status') && (
                    <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <StatusFilter 
                  column="status" 
                  value={filters.status} 
                  onChange={(value) => handleFilterChange('status', value)}
                  onClear={() => onFilterClear('status')}
                />
              </PopoverContent>
            </Popover>
          </div>
        </TableHead>
        
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
