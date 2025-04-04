
import React from "react";
import { SlidersHorizontal, Calendar } from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { countActiveFilters } from "./filterUtils";
import { WorkOrderFilters } from "../../types";
import { format } from "date-fns";

interface FilterSortTriggerProps {
  filters: WorkOrderFilters;
}

export const FilterSortTrigger = ({ filters }: FilterSortTriggerProps) => {
  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters = activeFilterCount > 0;
  const isShowingToday = filters.dateRange.from && 
    filters.dateRange.to && 
    format(filters.dateRange.from, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') &&
    format(filters.dateRange.to, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex items-center space-x-2">
      {isShowingToday && (
        <div className="flex items-center text-xs text-primary space-x-1 px-2 py-1 bg-primary/5 rounded-md">
          <Calendar size={14} className="text-primary" />
          <span>Today: {format(new Date(), 'MMM d, yyyy')}</span>
        </div>
      )}
      
      <SheetTrigger asChild>
        <button
          className={cn(
            "flex items-center space-x-1.5 py-1 px-2.5 rounded-full transition-all shrink-0",
            "bg-white border border-gray-200 hover:border-gray-300 shadow-sm",
            hasActiveFilters ? 'bg-primary/10 border-primary/20' : ''
          )}
        >
          <SlidersHorizontal 
            size={14}
            className="text-gray-700" 
          />
          <span className="text-xs font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] bg-primary text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </SheetTrigger>
    </div>
  );
};
