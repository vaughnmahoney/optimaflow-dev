
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    onSearch(value); // Immediate filtering as user types
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Filter work orders..."
        value={searchValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        className="min-w-[200px]"
      />
      <Button onClick={handleSearch}>
        Filter
      </Button>
    </div>
  );
};
