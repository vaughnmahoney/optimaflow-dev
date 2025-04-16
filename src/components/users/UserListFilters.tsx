
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, X } from "lucide-react";

interface Filters {
  role?: "admin" | "lead";
  search: string;
}

interface UserListFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  isLoading: boolean;
}

export function UserListFilters({ 
  filters, 
  onFiltersChange, 
  isLoading 
}: UserListFiltersProps) {
  const [search, setSearch] = useState(filters.search || "");
  const [role, setRole] = useState<"admin" | "lead" | undefined>(filters.role);
  
  // Apply filters when role changes
  useEffect(() => {
    onFiltersChange({
      ...filters,
      role,
    });
  }, [role]);
  
  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onFiltersChange({
      ...filters,
      search: search.trim(),
    });
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    setRole(undefined);
    
    onFiltersChange({
      search: "",
      role: undefined,
    });
  };
  
  // Check if any filters are active
  const hasActiveFilters = !!search || !!role;
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          Search
        </Button>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </form>
      
      <div>
        <div className="space-y-2">
          <div className="font-medium">Role</div>
          <RadioGroup 
            value={role} 
            onValueChange={(value) => setRole(value as "admin" | "lead" | undefined)}
            className="flex gap-4"
            disabled={isLoading}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="admin" id="filter-admin" />
              <Label htmlFor="filter-admin" className="cursor-pointer">Admin</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lead" id="filter-lead" />
              <Label htmlFor="filter-lead" className="cursor-pointer">Lead</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="filter-all" />
              <Label htmlFor="filter-all" className="cursor-pointer">All</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
