
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PopoverTrigger } from "@/components/ui/popover";

interface FilterButtonProps {
  isFiltered: boolean;
}

export const FilterButton = ({ isFiltered }: FilterButtonProps) => {
  return (
    <PopoverTrigger asChild>
      <Button 
        variant="ghost" 
        size="icon" 
        className={`h-6 w-6 ${isFiltered ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Filter className="h-3 w-3" />
        {isFiltered && (
          <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0" />
        )}
      </Button>
    </PopoverTrigger>
  );
};
