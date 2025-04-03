
import React from "react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterSortHeaderProps {
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export const FilterSortHeader = ({ 
  hasActiveFilters, 
  onClearAll 
}: FilterSortHeaderProps) => {
  return (
    <SheetHeader className="pb-2">
      <div className="flex justify-between items-center">
        <SheetTitle className="text-lg">Filters & Sort</SheetTitle>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClearAll}
            className="h-7 px-2"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Clear all</span>
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-0">Refine your work order view</p>
    </SheetHeader>
  );
};
