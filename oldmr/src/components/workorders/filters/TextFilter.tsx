
import { useState } from "react";
import { ColumnFilterProps } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const TextFilter = ({ column, value, onChange, onClear }: ColumnFilterProps) => {
  const [localValue, setLocalValue] = useState(value || "");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };
  
  const handleSubmit = () => {
    onChange(localValue.trim() || null);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  const handleClear = () => {
    setLocalValue("");
    onClear();
  };
  
  return (
    <div className="flex flex-col space-y-2 p-2">
      <div className="flex items-center space-x-1">
        <Input
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={`Filter ${column}...`}
          className="h-8 text-sm"
        />
        {localValue && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClear}
            className="h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSubmit}
          className="h-7 text-xs"
        >
          Apply
        </Button>
      </div>
    </div>
  );
};
