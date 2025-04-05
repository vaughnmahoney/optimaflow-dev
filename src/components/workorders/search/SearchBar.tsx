
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
    <div className="relative flex w-full max-w-[400px]">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        className="pr-16"
      />
      {searchValue && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute right-12 top-1/2 -translate-y-1/2 h-6 px-2"
          onClick={handleClear}
        >
          Clear
        </Button>
      )}
      <Button 
        size="sm" 
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
        onClick={handleSearch}
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  );
};
