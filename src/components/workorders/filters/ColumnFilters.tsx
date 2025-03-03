
import { useState } from "react";
import { ColumnFilterProps } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Text filter for order number and location columns
export const TextFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  const [localValue, setLocalValue] = useState(value || "");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };
  
  const handleSubmit = () => {
    onChange(localValue.trim() || null);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  const handleClear = () => {
    setLocalValue("");
    onClear();
  };
  
  return (
    <div className="flex flex-col space-y-2 p-2">
      <div className="flex items-center space-x-1">
        <Input
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={`Filter ${column}...`}
          className="h-8 text-sm"
        />
        {localValue && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClear}
            className="h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSubmit}
          className="h-7 text-xs"
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

// Date filter for service date column
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

// Status filter dropdown
export const StatusFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  const statuses = [
    { value: "pending_review", label: "Pending Review" },
    { value: "approved", label: "Approved" },
    { value: "flagged", label: "Flagged" }
  ];
  
  const handleStatusChange = (status: string) => {
    onChange(status);
  };
  
  return (
    <div className="flex flex-col p-2 space-y-1">
      {statuses.map(status => (
        <Button
          key={status.value}
          variant={value === status.value ? "default" : "ghost"}
          size="sm"
          className={cn(
            "justify-start h-7 text-xs",
            value === status.value ? "bg-primary text-primary-foreground" : ""
          )}
          onClick={() => handleStatusChange(status.value)}
        >
          {status.label}
        </Button>
      ))}
      
      {value && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="h-7 text-xs mt-2"
        >
          Clear filter
        </Button>
      )}
    </div>
  );
};

// Driver filter
export const DriverFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  // This is similar to TextFilter, but in a real implementation you might
  // fetch a list of drivers from the API and display them as options
  return (
    <TextFilter
      column={column}
      value={value}
      onChange={onChange}
      onClear={onClear}
    />
  );
};

// Location filter
export const LocationFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  // Similar to TextFilter, but in a real implementation you might
  // fetch a list of locations from the API
  return (
    <TextFilter
      column={column}
      value={value}
      onChange={onChange}
      onClear={onClear}
    />
  );
};
