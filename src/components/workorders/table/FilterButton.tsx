
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PopoverTrigger } from "@/components/ui/popover";

interface FilterButtonProps {
  isFiltered: boolean;
  onClickHandler: (e: React.MouseEvent) => void;
}

export const FilterButton = ({ isFiltered, onClickHandler }: FilterButtonProps) => {
  return (
    <PopoverTrigger asChild>
      <Button 
        variant="ghost" 
        size="icon" 
        className={`h-6 w-6 ml-1 ${isFiltered ? 'text-primary' : 'text-muted-foreground'}`}
        onClick={onClickHandler}
      >
        <Filter className="h-3 w-3" />
        {isFiltered && (
          <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0" />
        )}
      </Button>
    </PopoverTrigger>
  );
};
