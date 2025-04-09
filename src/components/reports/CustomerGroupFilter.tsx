
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Loader2, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFetchCustomerGroups } from '@/hooks/useFetchCustomerGroups';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface CustomerGroupFilterProps {
  selectedCustomerGroups: string[];
  setSelectedCustomerGroups: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CustomerGroupFilter: React.FC<CustomerGroupFilterProps> = ({
  selectedCustomerGroups,
  setSelectedCustomerGroups,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoading, customerGroups, error } = useFetchCustomerGroups();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter customer groups based on search query
  const filteredCustomerGroups = customerGroups.filter(group => 
    group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (currentValue: string) => {
    // Toggle selection
    setSelectedCustomerGroups(prev => 
      prev.includes(currentValue)
        ? prev.filter(item => item !== currentValue)
        : [...prev, currentValue]
    );
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from closing
    setSelectedCustomerGroups([]);
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
        {selectedCustomerGroups.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[180px] overflow-hidden">
            {selectedCustomerGroups.length === 1 ? (
              <Badge variant="secondary" className="text-xs font-normal">
                {selectedCustomerGroups[0]}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs font-normal">
                {selectedCustomerGroups.length} groups selected
              </Badge>
            )}
          </div>
        ) : (
          <span>Select Groups</span>
        )}
        <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", 
          open && "transform rotate-180")} />
      </Button>

      {selectedCustomerGroups.length > 0 && (
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
                  placeholder="Search groups..."
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
                  onClick={() => setSelectedCustomerGroups(filteredCustomerGroups)}
                  disabled={filteredCustomerGroups.length === 0}
                >
                  Select all
                </Button>
              </div>
            </div>
            
            <div className="max-h-[220px] overflow-y-auto overscroll-contain rounded-md">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading groups...</span>
                </div>
              ) : error ? (
                <div className="text-destructive py-4 text-center">Error loading customer groups</div>
              ) : filteredCustomerGroups.length === 0 ? (
                <div className="text-muted-foreground py-4 text-center">No groups found</div>
              ) : (
                filteredCustomerGroups.map((group) => (
                  <div 
                    key={group} 
                    className={cn(
                      "flex items-center space-x-2 py-1.5 px-2 hover:bg-accent rounded-sm cursor-pointer transition-colors",
                      selectedCustomerGroups.includes(group) && "bg-accent/50"
                    )}
                    onClick={() => handleSelect(group)}
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border border-primary",
                      selectedCustomerGroups.includes(group) ? "bg-primary" : "bg-transparent"
                    )}>
                      {selectedCustomerGroups.includes(group) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm flex-1 truncate">{group}</span>
                  </div>
                ))
              )}
            </div>
            
            {selectedCustomerGroups.length > 0 && (
              <div className="pt-2 border-t mt-2">
                <div className="text-xs text-muted-foreground">
                  {selectedCustomerGroups.length} {selectedCustomerGroups.length === 1 ? 'group' : 'groups'} selected
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
