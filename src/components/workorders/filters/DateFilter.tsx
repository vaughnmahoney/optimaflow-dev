
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
  
  const handleDateSelect = (date: Date | null) => {
    if (!dateRange.from) {
      setDateRange({ from: date, to: null });
    } else if (!dateRange.to && date && date > dateRange.from) {
      setDateRange({ from: dateRange.from, to: date });
      // Automatically apply when range is complete
      onChange({ from: dateRange.from, to: date });
    } else {
      setDateRange({ from: date, to: null });
    }
  };
  
  const handleClear = () => {
    setDateRange({ from: null, to: null });
    onClear();
  };
  
  return (
    <div className="flex flex-col p-2 space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-left font-normal h-8"
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
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: dateRange.from || undefined,
              to: dateRange.to || undefined,
            }}
            onSelect={(range) => {
              if (range) {
                setDateRange({
                  from: range.from || null,
                  to: range.to || null
                });
                onChange({
                  from: range.from || null,
                  to: range.to || null
                });
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
          onClick={handleClear}
          className="h-7 text-xs"
        >
          Clear dates
        </Button>
      )}
    </div>
  );
};
