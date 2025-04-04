
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { WorkOrderFilters } from "../types";

interface TodayDateButtonProps {
  className?: string;
  filters?: WorkOrderFilters;
  onDateChange?: (dateRange: { from: Date | null; to: Date | null }) => void;
}

export const TodayDateButton = ({ 
  className,
  filters,
  onDateChange
}: TodayDateButtonProps) => {
  const today = new Date();
  
  const handleSelect = (date: Date | undefined) => {
    if (!date || !onDateChange) return;
    
    // Set the date range to the selected date (full day)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    onDateChange({ 
      from: startOfDay, 
      to: endOfDay 
    });
  };
  
  // Determine the display date (either from filter or current date)
  const displayDate = filters?.dateRange?.from || today;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center space-x-1.5 py-1 px-2.5 rounded-full transition-all shrink-0",
            "bg-white border border-gray-200 hover:border-gray-300 shadow-sm",
            "text-xs font-medium h-auto",
            className
          )}
        >
          <CalendarIcon size={14} className="text-gray-700" />
          <span>
            {displayDate === today 
              ? `Today: ${format(today, "MMM d, yyyy")}` 
              : format(displayDate, "MMM d, yyyy")}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={displayDate}
          onSelect={handleSelect}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};
