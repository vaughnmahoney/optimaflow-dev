
import { ColumnFilterProps } from "./types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
