
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  optimoSearch: string;
  isSearching: boolean;
  onSearchChange: (value: string) => void;
  onOptimoSearchChange: (value: string) => void;
  onOptimoSearch: () => void;
}

export const SearchBar = ({
  searchQuery,
  optimoSearch,
  isSearching,
  onSearchChange,
  onOptimoSearchChange,
  onOptimoSearch,
}: SearchBarProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 max-w-sm">
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          placeholder="Import OptimoRoute order #"
          value={optimoSearch}
          onChange={(e) => onOptimoSearchChange(e.target.value)}
          className="w-64"
        />
        <Button 
          variant="secondary"
          onClick={onOptimoSearch}
          disabled={!optimoSearch.trim() || isSearching}
        >
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </div>
  );
};
