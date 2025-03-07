
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { SortDirection, SortField, WorkOrderFilters } from "../types";
import { ColumnHeader } from "./ColumnHeader";
import { FilterButton } from "./FilterButton";
import { TextFilter } from "../filters";
import { DateFilter } from "../filters";
import { DriverFilter } from "../filters";
import { LocationFilter } from "../filters";
import { StatusFilter } from "../filters";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";

interface WorkOrderTableHeaderProps {
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
  filters: WorkOrderFilters;
  onFilterChange: (column: string, value: any) => void;
  onFilterClear: (column: string) => void;
  selectable?: boolean;
  allSelected?: boolean;
  onSelectAll?: () => void;
}

export const WorkOrderTableHeader = ({
  sortField,
  sortDirection,
  onSort,
  filters,
  onFilterChange,
  onFilterClear,
  selectable = false,
  allSelected = false,
  onSelectAll
}: WorkOrderTableHeaderProps) => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (!onSort) return;

    if (sortField === field) {
      // Toggle direction: asc -> desc -> null
      if (sortDirection === "asc") {
        onSort(field, "desc");
      } else if (sortDirection === "desc") {
        onSort(null, null);
      } else {
        onSort(field, "asc");
      }
    } else {
      // New field, start with asc
      onSort(field, "asc");
    }
  };

  return (
    <TableHeader>
      <TableRow>
        {selectable && (
          <TableHead className="w-10">
            <Checkbox 
              checked={allSelected} 
              onCheckedChange={onSelectAll}
              aria-label="Select all work orders"
            />
          </TableHead>
        )}
        <ColumnHeader
          label="Order #"
          sortable
          sorted={sortField === "order_no" ? sortDirection : null}
          onSort={() => handleSort("order_no")}
        >
          <Popover open={openPopover === "order_no"} onOpenChange={(open) => setOpenPopover(open ? "order_no" : null)}>
            <FilterButton
              column="order_no"
              active={!!filters.orderNo}
              onClear={() => onFilterClear("order_no")}
            />
            <PopoverContent className="w-60 p-0" align="start" onClick={(e) => e.stopPropagation()}>
              <TextFilter
                column="order_no"
                value={filters.orderNo || ""}
                onChange={(value) => onFilterChange("order_no", value)}
                onClear={() => onFilterClear("order_no")}
              />
            </PopoverContent>
          </Popover>
        </ColumnHeader>

        <ColumnHeader
          label="Service Date"
          sortable
          sorted={sortField === "service_date" ? sortDirection : null}
          onSort={() => handleSort("service_date")}
        >
          <Popover open={openPopover === "service_date"} onOpenChange={(open) => setOpenPopover(open ? "service_date" : null)}>
            <FilterButton
              column="service_date"
              active={!!filters.dateRange.from || !!filters.dateRange.to}
              onClear={() => onFilterClear("service_date")}
            />
            <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
              <DateFilter
                column="service_date"
                value={filters.dateRange}
                onChange={(range) => onFilterChange("service_date", range)}
                onClear={() => onFilterClear("service_date")}
              />
            </PopoverContent>
          </Popover>
        </ColumnHeader>

        <ColumnHeader
          label="Driver"
          sortable
          sorted={sortField === "driver" ? sortDirection : null}
          onSort={() => handleSort("driver")}
        >
          <Popover open={openPopover === "driver"} onOpenChange={(open) => setOpenPopover(open ? "driver" : null)}>
            <FilterButton
              column="driver"
              active={!!filters.driver}
              onClear={() => onFilterClear("driver")}
            />
            <PopoverContent className="w-60 p-0" align="start" onClick={(e) => e.stopPropagation()}>
              <DriverFilter
                column="driver"
                value={filters.driver || ""}
                onChange={(value) => onFilterChange("driver", value)}
                onClear={() => onFilterClear("driver")}
              />
            </PopoverContent>
          </Popover>
        </ColumnHeader>

        <ColumnHeader
          label="Location"
          sortable
          sorted={sortField === "location" ? sortDirection : null}
          onSort={() => handleSort("location")}
        >
          <Popover open={openPopover === "location"} onOpenChange={(open) => setOpenPopover(open ? "location" : null)}>
            <FilterButton
              column="location"
              active={!!filters.location}
              onClear={() => onFilterClear("location")}
            />
            <PopoverContent className="w-60 p-0" align="start" onClick={(e) => e.stopPropagation()}>
              <LocationFilter
                column="location"
                value={filters.location || ""}
                onChange={(value) => onFilterChange("location", value)}
                onClear={() => onFilterClear("location")}
              />
            </PopoverContent>
          </Popover>
        </ColumnHeader>

        <ColumnHeader
          label="Status"
          sortable
          sorted={sortField === "status" ? sortDirection : null}
          onSort={() => handleSort("status")}
        >
          <Popover open={openPopover === "status"} onOpenChange={(open) => setOpenPopover(open ? "status" : null)}>
            <FilterButton
              column="status"
              active={!!filters.status}
              onClear={() => onFilterClear("status")}
            />
            <PopoverContent className="w-60 p-0" align="start" onClick={(e) => e.stopPropagation()}>
              <StatusFilter
                column="status"
                value={filters.status || ""}
                onChange={(value) => onFilterChange("status", value)}
                onClear={() => onFilterClear("status")}
              />
            </PopoverContent>
          </Popover>
        </ColumnHeader>

        <TableHead className="w-10">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
