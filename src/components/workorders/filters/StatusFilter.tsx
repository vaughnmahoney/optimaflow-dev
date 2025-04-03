
import { ColumnFilterProps } from "./types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Flag, Clock, CheckCheck, AlertTriangle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const StatusFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  const statuses = [
    { value: "pending_review", label: "Pending", icon: Clock, color: "text-yellow-500" },
    { value: "approved", label: "Approved", icon: Check, color: "text-green-500" },
    { value: "flagged", label: "Flagged", icon: Flag, color: "text-red-500" },
    { value: "resolved", label: "Resolved", icon: CheckCheck, color: "text-blue-500" },
    { value: "rejected", label: "Rejected", icon: AlertTriangle, color: "text-orange-500" }
  ];
  
  const handleStatusChange = (status: string) => {
    onChange(status);
  };
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="grid grid-cols-3 gap-1">
        {statuses.map(status => (
          <Button
            key={status.value}
            variant={value === status.value ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-7 px-2 text-xs",
              value === status.value 
                ? "bg-primary text-primary-foreground" 
                : "bg-transparent"
            )}
            onClick={() => handleStatusChange(status.value)}
          >
            <status.icon className={cn("h-3 w-3 mr-1", value !== status.value && status.color)} />
            {status.label}
          </Button>
        ))}
      </div>
      
      {value && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="h-6 p-0 text-xs text-muted-foreground hover:text-primary"
        >
          Clear
        </Button>
      )}
    </div>
  );
};
