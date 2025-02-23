
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const SearchBar = ({ onSearch }: { onSearch: (value: string) => void }) => {
  const [searchValue, setSearchValue] = useState("");

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
    onSearch(value);
  };

  return (
    <div className="relative flex w-full max-w-sm items-center">
      <div className="relative flex-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <Input
          type="text"
          placeholder="Filter work orders..."
          value={searchValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="h-10 pl-9 pr-4 text-sm bg-white/50 backdrop-blur-sm border-border/50 shadow-sm 
                   transition-all duration-200 hover:bg-white/80 focus:bg-white 
                   focus:shadow-md rounded-lg"
        />
      </div>
      <Button 
        onClick={handleSearch}
        className="ml-2 h-10 px-4 shadow-sm hover:shadow-md transition-all duration-200"
      >
        Filter
      </Button>
    </div>
  );
};
