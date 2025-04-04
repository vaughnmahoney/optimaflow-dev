
import { useState, useEffect } from "react";
import { ColumnFilterProps } from "./types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

export const DateFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  // Default to today if no date is selected
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [dateRange, setDateRange] = useState({
    from: value?.from || today,
    to: value?.to || today
  });
  
  // Update local state when value prop changes
  useEffect(() => {
    setDateRange({
      from: value?.from || today,
      to: value?.to || today
    });
  }, [value]);
  
  const handleClear = () => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    // Reset to today instead of null
    const todayRange = { from: todayDate, to: todayDate };
    setDateRange(todayRange);
    onChange(todayRange);
  };
  
  const isToday = dateRange.from && 
    format(dateRange.from, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') &&
    dateRange.to && 
    format(dateRange.to, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  
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
            className={`justify-start text-left font-normal h-8 ${isToday ? 'text-primary border-primary/30 bg-primary/5' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <CalendarIcon className={`mr-2 h-4 w-4 ${isToday ? 'text-primary' : ''}`} />
            {dateRange.from ? (
              dateRange.to ? (
                isToday ? (
                  <span className="font-medium">Today: {format(dateRange.from, "LLL dd, y")}</span>
                ) : (
                  <span>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </span>
                )
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
                  from: range.from || today,
                  to: range.to || today
                };
                setDateRange(newRange);
                // Update parent state but don't apply filter immediately
                onChange(newRange);
              }
            }}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      {/* Change the reset button text when not showing today */}
      {!isToday && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
          className="h-7 text-xs"
        >
          Show today
        </Button>
      )}
    </div>
  );
};
