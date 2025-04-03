
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
    <SheetHeader>
      <SheetTitle>Filters & Sort</SheetTitle>
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Refine your work order view</p>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClearAll}
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>
    </SheetHeader>
  );
};
