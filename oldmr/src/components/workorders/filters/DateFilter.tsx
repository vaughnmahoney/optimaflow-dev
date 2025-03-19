
import { useState } from "react";
import { ColumnFilterProps } from "./types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

export const DateFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  const [dateRange, setDateRange] = useState({
    from: value?.from || null,
    to: value?.to || null
  });
  
  const handleClear = () => {
    setDateRange({ from: null, to: null });
    onClear();
  };
  
  // Stop clicks from propagating to the table header
  const handlePopoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div className="flex flex-col p-2 space-y-2" onClick={handlePopoverClick}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-left font-normal h-8"
            onClick={(e) => e.stopPropagation()}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <span>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </span>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="start"
          onClick={(e) => e.stopPropagation()}
        >
          <Calendar
            mode="range"
            selected={{
              from: dateRange.from || undefined,
              to: dateRange.to || undefined,
            }}
            onSelect={(range) => {
              if (range) {
                const newRange = {
                  from: range.from || null,
                  to: range.to || null
                };
                setDateRange(newRange);
                
                // Only call onChange when we have a complete range or when clearing
                if (newRange.from === null || (newRange.from && newRange.to)) {
                  onChange(newRange);
                }
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {(dateRange.from || dateRange.to) && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
          className="h-7 text-xs"
        >
          Clear dates
        </Button>
      )}
    </div>
  );
};
