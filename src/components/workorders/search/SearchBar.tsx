
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ 
  initialValue = "", 
  onSearch, 
  placeholder = "Search orders..." 
}: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const isMobile = useIsMobile();
  
  // Sync with external value if it changes
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  const handleSearch = () => {
    onSearch(searchValue.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  const handleClear = () => {
    setSearchValue("");
    onSearch("");
  };

  return (
    <div className="relative flex w-full max-w-xs">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        className="pr-16 h-9"
      />
      {searchValue && (
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute right-8 top-1/2 -translate-y-1/2 h-full w-8"
          onClick={handleClear}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Clear</span>
        </Button>
      )}
      <Button 
        size="icon" 
        className="absolute right-0 top-0 h-full w-8 rounded-l-none"
        onClick={handleSearch}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  );
};
