
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
    <div className="mb-2">
      <h3 className="text-sm font-medium">Sort Orders</h3>
      <div className="mt-2">
        <Button 
          variant="outline"
          className="w-full justify-start"
          onClick={toggleDateSort}
        >
          {sortDirection === 'asc' ? (
            <>
              <ArrowUp className="h-4 w-4 mr-2" />
              <span>Showing oldest first</span>
            </>
          ) : (
            <>
              <ArrowDown className="h-4 w-4 mr-2" />
              <span>Showing newest first</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
