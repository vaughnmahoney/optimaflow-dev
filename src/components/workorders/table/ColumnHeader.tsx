import { TableHead } from "@/components/ui/table";
import { SortDirection } from "../types";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { FilterButton } from "./FilterButton";
import { ReactNode } from "react";

interface ColumnHeaderProps {
  label: string;
  column: string;
  sortable?: boolean;
  sortDirection: SortDirection;
  onSort: () => void;
  isFiltered: boolean;
  filterContent: ReactNode;
  isPopoverOpen: boolean;
  setOpenPopover: (value: string | null) => void;
}

export const ColumnHeader = ({ 
  label, 
  column, 
  sortable = true, 
  sortDirection, 
  onSort,
  isFiltered,
  filterContent,
  isPopoverOpen,
  setOpenPopover
}: ColumnHeaderProps) => {
  
  // Completely prevent sorting when clicking on filter button or popover
  const handleFilterInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Handle opening/closing the popover
  const handlePopoverChange = (open: boolean) => {
    setOpenPopover(open ? column : null);
  };

  return (
    <TableHead 
      sortable={sortable}
      sortDirection={sortDirection}
      onSort={onSort}
      className="relative font-semibold text-gray-700 dark:text-gray-300 py-3 transition-colors"
    >
      <div className="flex items-center">
        <span className="hover:text-primary transition-colors">{label}</span>
        {/* Wrap popover in a div that stops propagation */}
        <div onClick={handleFilterInteraction} className="ml-1">
          <Popover 
            open={isPopoverOpen} 
            onOpenChange={handlePopoverChange}
          >
            <FilterButton 
              isFiltered={isFiltered} 
            />
            <PopoverContent 
              className="w-60 p-0 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg" 
              align="start"
            >
              {filterContent}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TableHead>
  );
};
