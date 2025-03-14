
import { ColumnFilterProps } from "./types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Flag, Clock, CheckCheck } from "lucide-react";

export const StatusFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  const statuses = [
    { value: "pending_review", label: "Pending Review", icon: Clock, color: "text-yellow-500" },
    { value: "approved", label: "Approved", icon: Check, color: "text-green-500" },
    { value: "flagged", label: "Flagged", icon: Flag, color: "text-red-500" },
    { value: "resolved", label: "Resolved", icon: CheckCheck, color: "text-blue-500" }
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
            "justify-start h-8 text-xs",
            value === status.value ? "bg-primary text-primary-foreground" : ""
          )}
          onClick={() => handleStatusChange(status.value)}
        >
          <status.icon className={cn("h-3.5 w-3.5 mr-2", value !== status.value && status.color)} />
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
