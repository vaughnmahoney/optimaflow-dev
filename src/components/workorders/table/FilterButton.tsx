
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PopoverTrigger } from "@/components/ui/popover";
import { ReactNode } from "react";

interface FilterButtonProps {
  column: string;
  active: boolean;
  onClear: () => void;
  children?: ReactNode; // Add children prop
}

export const FilterButton = ({ column, active, onClear, children }: FilterButtonProps) => {
  return (
    <PopoverTrigger asChild>
      <Button 
        variant="ghost" 
        size="icon" 
        className={`h-6 w-6 ${active ? 'text-primary' : 'text-muted-foreground'}`}
        onClick={(e) => e.stopPropagation()} // Prevent triggering the sort
      >
        <Filter className="h-3 w-3" />
        {active && (
          <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0" />
        )}
      </Button>
    </PopoverTrigger>
  );
};
