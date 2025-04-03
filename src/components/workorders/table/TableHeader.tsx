
import { TableHead, TableHeader as UITableHeader, TableRow } from "@/components/ui/table";
import { SortDirection, SortField, WorkOrderFilters } from "../types";
import { useState } from "react";
import { TextFilter, DateFilter, StatusFilter, DriverFilter, LocationFilter } from "../filters";
import { ColumnHeader } from "./ColumnHeader";
import { isColumnFiltered } from "./utils";

interface TableHeaderProps {
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
  filters: WorkOrderFilters;
  onColumnFilterChange: (column: string, value: any) => void;
  onColumnFilterClear: (column: string) => void;
}

export const TableHeader = ({ 
  sortField, 
  sortDirection, 
  onSort,
  filters,
  onColumnFilterChange,
  onColumnFilterClear
}: TableHeaderProps) => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  
  const handleFilterChange = (column: string, value: any) => {
    onColumnFilterChange(column, value);
    // Don't close popover immediately to allow for multiple selections
  };
  
  const closePopover = () => {
    setOpenPopover(null);
  };

  return (
    <UITableHeader>
      <TableRow>
        <ColumnHeader
          label="Order #"
          column="order_no"
          sortDirection={sortField === 'order_no' ? sortDirection : null}
          onSort={() => onSort?.('order_no')}
          isFiltered={isColumnFiltered('order_no', filters)}
          filterContent={
            <TextFilter 
              column="order_no" 
              value={filters.orderNo} 
              onChange={(value) => handleFilterChange('order_no', value)}
              onClear={() => {
                onColumnFilterClear('order_no');
                closePopover();
              }}
            />
          }
          isPopoverOpen={openPopover === 'order_no'}
          setOpenPopover={setOpenPopover}
        />
        
        <ColumnHeader
          label="Service Date"
          column="end_time" 
          sortDirection={sortField === 'end_time' ? sortDirection : null} 
          onSort={() => onSort?.('end_time')} 
          isFiltered={isColumnFiltered('service_date', filters)} 
          filterContent={
            <DateFilter 
              column="service_date" 
              value={filters.dateRange} 
              onChange={(value) => handleFilterChange('service_date', value)}
              onClear={() => {
                onColumnFilterClear('service_date');
                closePopover();
              }}
            />
          }
          isPopoverOpen={openPopover === 'service_date'}
          setOpenPopover={setOpenPopover}
        />
        
        <ColumnHeader
          label="Driver"
          column="driver"
          sortDirection={sortField === 'driver' ? sortDirection : null}
          onSort={() => onSort?.('driver')}
          isFiltered={isColumnFiltered('driver', filters)}
          filterContent={
            <DriverFilter 
              column="driver" 
              value={filters.driver} 
              onChange={(value) => handleFilterChange('driver', value)}
              onClear={() => {
                onColumnFilterClear('driver');
                closePopover();
              }}
            />
          }
          isPopoverOpen={openPopover === 'driver'}
          setOpenPopover={setOpenPopover}
        />
        
        <ColumnHeader
          label="Location"
          column="location"
          sortDirection={sortField === 'location' ? sortDirection : null}
          onSort={() => onSort?.('location')}
          isFiltered={isColumnFiltered('location', filters)}
          filterContent={
            <LocationFilter 
              column="location" 
              value={filters.location} 
              onChange={(value) => handleFilterChange('location', value)}
              onClear={() => {
                onColumnFilterClear('location');
                closePopover();
              }}
            />
          }
          isPopoverOpen={openPopover === 'location'}
          setOpenPopover={setOpenPopover}
        />
        
        <ColumnHeader
          label="Status"
          column="status"
          sortDirection={sortField === 'status' ? sortDirection : null}
          onSort={() => onSort?.('status')}
          isFiltered={isColumnFiltered('status', filters)}
          filterContent={
            <StatusFilter 
              column="status" 
              value={filters.status} 
              onChange={(value) => handleFilterChange('status', value)}
              onClear={() => {
                onColumnFilterClear('status');
                closePopover();
              }}
            />
          }
          isPopoverOpen={openPopover === 'status'}
          setOpenPopover={setOpenPopover}
        />
        
        <TableHead>Actions</TableHead>
      </TableRow>
    </UITableHeader>
  );
};
