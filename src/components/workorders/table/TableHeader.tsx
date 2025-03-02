
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortDirection, SortField } from "../types";

interface WorkOrderTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const WorkOrderTableHeader = ({ 
  sortField, 
  sortDirection, 
  onSort 
}: WorkOrderTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          sortable
          sortDirection={sortField === 'order_no' ? sortDirection : null}
          onSort={() => onSort('order_no')}
        >
          Order #
        </TableHead>
        <TableHead 
          sortable
          sortDirection={sortField === 'service_date' ? sortDirection : null}
          onSort={() => onSort('service_date')}
        >
          Service Date
        </TableHead>
        <TableHead 
          sortable
          sortDirection={sortField === 'driver' ? sortDirection : null}
          onSort={() => onSort('driver')}
        >
          Driver
        </TableHead>
        <TableHead 
          sortable
          sortDirection={sortField === 'location' ? sortDirection : null}
          onSort={() => onSort('location')}
        >
          Location
        </TableHead>
        <TableHead 
          sortable
          sortDirection={sortField === 'status' ? sortDirection : null}
          onSort={() => onSort('status')}
        >
          Status
        </TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
