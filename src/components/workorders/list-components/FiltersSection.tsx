
import { StatusFilterCards } from "../filters/StatusFilterCards";
import { WorkOrderFilters, SortDirection, SortField } from "../types";
import { useQueryClient } from "@tanstack/react-query";

interface FiltersSectionProps {
  filters: WorkOrderFilters;
  onFiltersChange: (filters: WorkOrderFilters) => void;
  statusCounts: {
    approved: number;
    pending_review: number;
    flagged: number;
    resolved: number;
    rejected: number;
    all?: number;
  };
  onColumnFilterChange: (column: string, value: any) => void;
  clearColumnFilter: (column: string) => void;
  clearAllFilters: () => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
}

export const FiltersSection = ({
  filters,
  onFiltersChange,
  statusCounts,
  onColumnFilterChange,
  clearColumnFilter,
  clearAllFilters,
  sortField,
  sortDirection,
  onSort
}: FiltersSectionProps) => {
  const queryClient = useQueryClient();

  const handleStatusFilterChange = (status: string | null) => {
    // When filter changes, refresh the data to show accurate statuses
    queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    
    onFiltersChange({
      ...filters,
      status
    });
  };

  return (
    <div className="flex justify-between items-center">
      <StatusFilterCards 
        statusFilter={filters.status}
        onStatusFilterChange={handleStatusFilterChange}
        statusCounts={statusCounts}
        filters={filters}
        onColumnFilterChange={onColumnFilterChange}
        clearColumnFilter={clearColumnFilter}
        clearAllFilters={clearAllFilters}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
      />
    </div>
  );
};
