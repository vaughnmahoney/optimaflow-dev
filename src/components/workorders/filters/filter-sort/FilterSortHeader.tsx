
import React from "react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const FilterSortHeader = () => {
  return (
    <SheetHeader className="pb-2">
      <SheetTitle className="text-lg">Filters & Sort</SheetTitle>
      <p className="text-xs text-muted-foreground mt-0">Refine your work order view</p>
    </SheetHeader>
  );
};
