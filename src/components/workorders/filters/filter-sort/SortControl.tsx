
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { SortDirection, SortField } from "../../types";

interface SortControlProps {
  sortDirection: SortDirection;
  onSort: (field: SortField, direction: SortDirection) => void;
}

export const SortControl = ({ 
  sortDirection, 
  onSort 
}: SortControlProps) => {
  const toggleDateSort = () => {
    // Toggle between oldest first (asc) and newest first (desc)
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    onSort('end_time', newDirection);
  };

  return (
    <div className="mb-1">
      <h3 className="text-xs font-medium text-muted-foreground mb-1.5">Sort Orders</h3>
      <div>
        <Button 
          variant="outline"
          size="sm"
          className="w-full justify-start h-8 text-xs font-normal"
          onClick={toggleDateSort}
        >
          {sortDirection === 'asc' ? (
            <>
              <ArrowUp className="h-3.5 w-3.5 mr-1.5" />
              <span>Oldest first</span>
            </>
          ) : (
            <>
              <ArrowDown className="h-3.5 w-3.5 mr-1.5" />
              <span>Newest first</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
