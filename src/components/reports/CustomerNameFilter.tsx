
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Loader2, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFetchCustomerNames } from '@/hooks/useFetchCustomerNames';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface CustomerNameFilterProps {
  selectedCustomerNames: string[];
  setSelectedCustomerNames: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CustomerNameFilter: React.FC<CustomerNameFilterProps> = ({
  selectedCustomerNames,
  setSelectedCustomerNames,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoading, customerNames, error } = useFetchCustomerNames();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter customer names based on search query
  const filteredCustomerNames = customerNames.filter(name => 
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (currentValue: string) => {
    // Toggle selection
    setSelectedCustomerNames(prev => 
      prev.includes(currentValue)
        ? prev.filter(item => item !== currentValue)
        : [...prev, currentValue]
    );
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from closing
    setSelectedCustomerNames([]);
  };
  
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="min-w-[200px] justify-between flex items-center"
      >
        {selectedCustomerNames.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[180px] overflow-hidden">
            {selectedCustomerNames.length === 1 ? (
              <Badge variant="secondary" className="text-xs font-normal">
                {selectedCustomerNames[0]}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs font-normal">
                {selectedCustomerNames.length} customers selected
              </Badge>
            )}
          </div>
        ) : (
          <span>Select Customers</span>
        )}
        <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", 
          open && "transform rotate-180")} />
      </Button>

      {selectedCustomerNames.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-5 w-5 p-0 absolute right-8 top-1/2 -translate-y-1/2"
          onClick={handleClearAll}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-[300px] rounded-md border bg-popover shadow-lg border-border" style={{ maxHeight: '350px' }}>
          <div className="p-2 space-y-2">
            <div className="sticky top-0 bg-popover pt-1 pb-2 px-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="flex justify-between mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={handleClearAll}
                >
                  Clear all
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => setSelectedCustomerNames(filteredCustomerNames)}
                  disabled={filteredCustomerNames.length === 0}
                >
                  Select all
                </Button>
              </div>
            </div>
            
            <div className="max-h-[220px] overflow-y-auto overscroll-contain rounded-md">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading customers...</span>
                </div>
              ) : error ? (
                <div className="text-destructive py-4 text-center">Error loading customer names</div>
              ) : filteredCustomerNames.length === 0 ? (
                <div className="text-muted-foreground py-4 text-center">No customers found</div>
              ) : (
                filteredCustomerNames.map((name) => (
                  <div 
                    key={name} 
                    className={cn(
                      "flex items-center space-x-2 py-1.5 px-2 hover:bg-accent rounded-sm cursor-pointer transition-colors",
                      selectedCustomerNames.includes(name) && "bg-accent/50"
                    )}
                    onClick={() => handleSelect(name)}
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border border-primary",
                      selectedCustomerNames.includes(name) ? "bg-primary" : "bg-transparent"
                    )}>
                      {selectedCustomerNames.includes(name) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm flex-1 truncate">{name}</span>
                  </div>
                ))
              )}
            </div>
            
            {selectedCustomerNames.length > 0 && (
              <div className="pt-2 border-t mt-2">
                <div className="text-xs text-muted-foreground">
                  {selectedCustomerNames.length} {selectedCustomerNames.length === 1 ? 'customer' : 'customers'} selected
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
