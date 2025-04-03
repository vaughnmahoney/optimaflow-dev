
import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { countActiveFilters } from "./filterUtils";
import { WorkOrderFilters } from "../../types";

interface FilterSortTriggerProps {
  filters: WorkOrderFilters;
}

export const FilterSortTrigger = ({ filters }: FilterSortTriggerProps) => {
  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <SheetTrigger asChild>
      <button
        className={cn(
          "flex items-center space-x-1.5 py-1 px-2.5 rounded-full transition-all shrink-0",
          "bg-white border border-gray-200 hover:border-gray-300 shadow-sm",
          hasActiveFilters ? 'bg-primary/10 border-primary/20' : ''
        )}
      >
        <div className={cn(
          "flex items-center justify-center w-4 h-4 rounded-full",
          "bg-gray-200"
        )}>
          <SlidersHorizontal 
            size={12}
            className="text-gray-700" 
          />
        </div>
        <span className="text-xs font-medium">Filters</span>
        {hasActiveFilters && (
          <span className="inline-flex items-center justify-center text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] bg-primary text-white">
            {activeFilterCount}
          </span>
        )}
      </button>
    </SheetTrigger>
  );
};
