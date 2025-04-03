
import { useState, useEffect } from "react";
import { ColumnFilterProps } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const TextFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  const [localValue, setLocalValue] = useState(value || "");
  
  // Update local state when value prop changes
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    // Store the value in parent component without immediately applying the filter
    onChange(e.target.value.trim() || null);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onChange(localValue.trim() || null);
    }
  };
  
  const handleClear = () => {
    setLocalValue("");
    onClear();
  };
  
  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex items-center space-x-1">
        <Input
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={`Filter ${column}...`}
          className="h-7 text-xs"
        />
        {localValue && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClear}
            className="h-5 w-5"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
