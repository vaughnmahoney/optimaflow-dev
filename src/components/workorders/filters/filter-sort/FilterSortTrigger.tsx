
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
          "flex items-center space-x-2 py-1.5 px-3 rounded-full transition-all duration-200 shrink-0",
          "shadow-sm transform hover:translate-y-[-1px]",
          hasActiveFilters 
            ? 'bg-[#193B68]/15 border border-[#193B68]/30' 
            : 'bg-white border border-gray-200/80 hover:border-gray-300'
        )}
      >
        <div className={cn(
          "flex items-center justify-center w-5 h-5 rounded-full",
          "bg-[#193B68]"
        )}>
          <SlidersHorizontal 
            size={14}
            className="text-white" 
          />
        </div>
        <span className="text-xs font-medium">Filters</span>
        {hasActiveFilters && (
          <span className="inline-flex items-center justify-center text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[20px] h-[20px] bg-[#193B68] text-white">
            {activeFilterCount}
          </span>
        )}
      </button>
    </SheetTrigger>
  );
};
