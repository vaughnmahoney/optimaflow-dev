
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
          <FilterButton
            column="order_no"
            active={!!filters.orderNo}
            onClear={() => onFilterClear("order_no")}
          >
            <TextFilter
              value={filters.orderNo || ""}
              onChange={(value) => onFilterChange("order_no", value)}
              placeholder="Filter by order #"
            />
          </FilterButton>
        </ColumnHeader>

        <ColumnHeader
          label="Service Date"
          sortable
          sorted={sortField === "service_date" ? sortDirection : null}
          onSort={() => handleSort("service_date")}
        >
          <FilterButton
            column="service_date"
            active={!!filters.dateRange.from || !!filters.dateRange.to}
            onClear={() => onFilterClear("service_date")}
          >
            <DateFilter
              dateRange={filters.dateRange}
              onChange={(range) => onFilterChange("service_date", range)}
            />
          </FilterButton>
        </ColumnHeader>

        <ColumnHeader
          label="Driver"
          sortable
          sorted={sortField === "driver" ? sortDirection : null}
          onSort={() => handleSort("driver")}
        >
          <FilterButton
            column="driver"
            active={!!filters.driver}
            onClear={() => onFilterClear("driver")}
          >
            <DriverFilter
              value={filters.driver || ""}
              onChange={(value) => onFilterChange("driver", value)}
            />
          </FilterButton>
        </ColumnHeader>

        <ColumnHeader
          label="Location"
          sortable
          sorted={sortField === "location" ? sortDirection : null}
          onSort={() => handleSort("location")}
        >
          <FilterButton
            column="location"
            active={!!filters.location}
            onClear={() => onFilterClear("location")}
          >
            <LocationFilter
              value={filters.location || ""}
              onChange={(value) => onFilterChange("location", value)}
            />
          </FilterButton>
        </ColumnHeader>

        <ColumnHeader
          label="Status"
          sortable
          sorted={sortField === "status" ? sortDirection : null}
          onSort={() => handleSort("status")}
        >
          <FilterButton
            column="status"
            active={!!filters.status}
            onClear={() => onFilterClear("status")}
          >
            <StatusFilter
              value={filters.status || ""}
              onChange={(value) => onFilterChange("status", value)}
            />
          </FilterButton>
        </ColumnHeader>

        <TableHead className="w-10">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
