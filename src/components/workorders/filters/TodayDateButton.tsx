
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
  
  const handleSelect = (dateRange: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!dateRange || !onDateChange) return;
    
    onDateChange({ 
      from: dateRange.from || null, 
      to: dateRange.to || null 
    });
  };
  
  // Determine the display date range
  const from = filters?.dateRange?.from;
  const to = filters?.dateRange?.to;
  
  // Format the display text
  let displayText;
  if (from && to) {
    if (from.toDateString() === today.toDateString() && to.toDateString() === today.toDateString()) {
      displayText = `Today: ${format(today, "MMM d")}`;
    } else if (from.toDateString() === to.toDateString()) {
      displayText = format(from, "MMM d");
    } else {
      displayText = `${format(from, "MMM d")}-${format(to, "MMM d")}`;
    }
  } else if (from) {
    displayText = from.toDateString() === today.toDateString() 
      ? `Today: ${format(today, "MMM d")}` 
      : format(from, "MMM d");
  } else {
    displayText = `Today: ${format(today, "MMM d")}`;
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center space-x-1.5 py-1 px-2 rounded-full transition-all shrink-0",
            "bg-white border border-gray-200 hover:border-gray-300 shadow-sm",
            "text-xs font-medium h-auto",
            className
          )}
        >
          <CalendarIcon size={12} className="text-gray-700" />
          <span>{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{
            from: from || undefined,
            to: to || undefined
          }}
          onSelect={handleSelect}
          initialFocus
          className="pointer-events-auto scale-90 origin-top-left"
        />
      </PopoverContent>
    </Popover>
  );
};
