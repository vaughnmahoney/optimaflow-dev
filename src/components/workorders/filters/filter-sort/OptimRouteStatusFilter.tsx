
import React from "react";
import { Button } from "@/components/ui/button";
import { FilterOption } from "./FilterOption";

interface OptimRouteStatusFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onClear: () => void;
}

export const OptimRouteStatusFilter = ({ 
  value, 
  onChange, 
  onClear 
}: OptimRouteStatusFilterProps) => {
  const handleStatusChange = (status: string) => {
    onChange(value === status ? null : status);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <FilterOption 
          label="Success"
          isActive={value === 'success'}
          onClick={() => handleStatusChange('success')}
          className="flex-1"
        />
        
        <FilterOption 
          label="Failed"
          isActive={value === 'failed'}
          onClick={() => handleStatusChange('failed')}
          className="flex-1"
        />
        
        <FilterOption 
          label="Rejected"
          isActive={value === 'rejected'}
          onClick={() => handleStatusChange('rejected')}
          className="flex-1"
        />
      </div>
      {value !== null && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="mt-1 h-auto p-0 text-xs text-muted-foreground hover:text-primary"
        >
          Clear
        </Button>
      )}
    </div>
  );
};
