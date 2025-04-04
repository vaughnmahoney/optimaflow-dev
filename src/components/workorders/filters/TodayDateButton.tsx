
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TodayDateButtonProps {
  className?: string;
}

export const TodayDateButton = ({ className }: TodayDateButtonProps) => {
  const today = new Date();
  
  return (
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
      <span>Today: {format(today, "MMM d, yyyy")}</span>
    </Button>
  );
};
