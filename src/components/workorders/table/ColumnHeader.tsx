
import { TableHead } from "@/components/ui/table";
import { SortDirection } from "../types";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { FilterButton } from "./FilterButton";
import { ReactNode } from "react";

interface ColumnHeaderProps {
  label: string;
  sortable?: boolean;
  sorted: SortDirection;
  onSort: () => void;
  children?: ReactNode; // Add children prop
}

export const ColumnHeader = ({ 
  label, 
  sortable = true, 
  sorted, 
  onSort,
  children
}: ColumnHeaderProps) => {
  
  return (
    <TableHead 
      onClick={sortable ? onSort : undefined}
      className="relative cursor-pointer select-none"
    >
      <div className="flex items-center">
        <span>{label}</span>
        {sorted === "asc" && <span className="ml-1">↑</span>}
        {sorted === "desc" && <span className="ml-1">↓</span>}
        {children}
      </div>
    </TableHead>
  );
};
