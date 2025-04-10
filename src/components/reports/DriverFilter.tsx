import React, { useState } from 'react';
import { ChevronDown, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFetchDrivers } from '@/hooks/useFetchDrivers';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DriverFilterProps {
  selectedDrivers: string[];
  setSelectedDrivers: React.Dispatch<React.SetStateAction<string[]>>;
}

export const DriverFilter: React.FC<DriverFilterProps> = ({
  selectedDrivers,
  setSelectedDrivers,
}) => {
  const [open, setOpen] = useState(false);
  const { isLoading, drivers, error } = useFetchDrivers();

  const handleSelect = (currentValue: string) => {
    // Toggle selection
    setSelectedDrivers(prev => 
      prev.includes(currentValue)
        ? prev.filter(item => item !== currentValue)
        : [...prev, currentValue]
    );
  };

  const handleRemove = (driver: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent popover from closing
    setSelectedDrivers(prev => prev.filter(item => item !== driver));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent popover from closing
    setSelectedDrivers([]);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="min-w-[200px] justify-between flex items-center"
      >
        {selectedDrivers.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[180px] overflow-hidden">
            {selectedDrivers.length === 1 ? (
              <span className="text-sm">
                {selectedDrivers[0]}
              </span>
            ) : (
              <span className="text-sm">
                {selectedDrivers.length} drivers selected
              </span>
            )}
          </div>
        ) : (
          <span>Select Drivers</span>
        )}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {selectedDrivers.length > 0 && (
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
                  <span>Loading drivers...</span>
                </div>
              ) : error ? (
                <div className="text-destructive py-2">Error loading drivers</div>
              ) : drivers.length === 0 ? (
                <div className="text-muted-foreground py-2">No drivers found</div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto">
                  {drivers.map((driver) => (
                    <div 
                      key={driver} 
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                      onClick={() => handleSelect(driver)}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedDrivers.includes(driver)}
                        onChange={() => {}} // Handled by the div click
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{driver}</span>
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
