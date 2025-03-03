
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
  
  // Prevent sorting when clicking on filter button
  const handleFilterButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent sort trigger
  };

  // Prevent sorting when opening/closing the popover
  const handlePopoverChange = (open: boolean, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setOpenPopover(open ? column : null);
  };

  return (
    <TableHead 
      sortable={sortable}
      sortDirection={sortDirection}
      onSort={onSort}
      className="relative"
    >
      <div className="flex items-center">
        <span>{label}</span>
        <Popover 
          open={isPopoverOpen} 
          onOpenChange={(open) => handlePopoverChange(open)}
        >
          <FilterButton 
            isFiltered={isFiltered} 
            onClickHandler={handleFilterButtonClick} 
          />
          <PopoverContent 
            className="w-60 p-0" 
            align="start" 
            onClick={(e) => e.stopPropagation()}
          >
            {filterContent}
          </PopoverContent>
        </Popover>
      </div>
    </TableHead>
  );
};
