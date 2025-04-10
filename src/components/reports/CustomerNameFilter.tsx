import React, { useState } from 'react';
import { ChevronDown, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFetchCustomerNames } from '@/hooks/useFetchCustomerNames';

interface CustomerNameFilterProps {
  selectedCustomerNames: string[];
  setSelectedCustomerNames: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CustomerNameFilter: React.FC<CustomerNameFilterProps> = ({
  selectedCustomerNames,
  setSelectedCustomerNames,
}) => {
  const [open, setOpen] = useState(false);
  const { isLoading, customerNames, error } = useFetchCustomerNames();

  const handleSelect = (currentValue: string) => {
    // Toggle selection
    setSelectedCustomerNames(prev => 
      prev.includes(currentValue)
        ? prev.filter(item => item !== currentValue)
        : [...prev, currentValue]
    );
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from closing
    setSelectedCustomerNames([]);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="min-w-[200px] justify-between flex items-center"
      >
        {selectedCustomerNames.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[180px] overflow-hidden">
            {selectedCustomerNames.length === 1 ? (
              <span className="text-sm">
                {selectedCustomerNames[0]}
              </span>
            ) : (
              <span className="text-sm">
                {selectedCustomerNames.length} customers selected
              </span>
            )}
          </div>
        ) : (
          <span>Select Customers</span>
        )}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {selectedCustomerNames.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-5 w-5 p-0 absolute right-8 top-1/2 -translate-y-1/2"
          onClick={handleClearAll}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-[300px] rounded-md border bg-popover shadow-md">
          <div className="p-2">
            <div className="mb-2 px-2 text-sm font-medium">
              {isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading customer names...</span>
                </div>
              ) : error ? (
                <div className="text-destructive py-2">Error loading customer names</div>
              ) : customerNames.length === 0 ? (
                <div className="text-muted-foreground py-2">No customer names found</div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto">
                  {customerNames.map((name) => (
                    <div 
                      key={name} 
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                      onClick={() => handleSelect(name)}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedCustomerNames.includes(name)}
                        onChange={() => {}} // Handled by the div click
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
