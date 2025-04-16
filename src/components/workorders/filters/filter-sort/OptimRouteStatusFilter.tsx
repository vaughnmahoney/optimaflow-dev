
import React from "react";
import { Button } from "@/components/ui/button";
import { FilterOption } from "./FilterOption";
import { Check, X, AlertTriangle } from "lucide-react";

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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <FilterOption 
          label="Success"
          icon={<Check className="h-3 w-3" />}
          isActive={value === 'success'}
          onClick={() => handleStatusChange('success')}
          className="flex-1"
        />
        
        <FilterOption 
          label="Failed"
          icon={<X className="h-3 w-3" />}
          isActive={value === 'failed'}
          onClick={() => handleStatusChange('failed')}
          className="flex-1"
        />
        
        <FilterOption 
          label="Rejected"
          icon={<AlertTriangle className="h-3 w-3" />}
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
          className="h-6 p-0 text-xs text-muted-foreground hover:text-primary"
        >
          Clear
        </Button>
      )}
    </div>
  );
};
