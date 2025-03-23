
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface Filters {
  role: "admin" | "lead" | undefined;
  isActive: boolean | undefined;
  search: string;
}

interface UserListFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  isLoading: boolean;
}

export function UserListFilters({ filters, onFiltersChange, isLoading }: UserListFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchValue]);

  const handleRoleChange = (value: string) => {
    onFiltersChange({
      ...filters,
      role: value === "all" ? undefined : (value as "admin" | "lead"),
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isActive: value === "all" ? undefined : value === "active",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
      <div className="w-full sm:w-auto flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="w-full sm:w-[150px]">
        <Label htmlFor="role-filter" className="sr-only">
          Filter by role
        </Label>
        <Select
          value={filters.role || "all"}
          onValueChange={handleRoleChange}
          disabled={isLoading}
        >
          <SelectTrigger id="role-filter">
            <SelectValue placeholder="Role: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[150px]">
        <Label htmlFor="status-filter" className="sr-only">
          Filter by status
        </Label>
        <Select
          value={filters.isActive === undefined 
            ? "all" 
            : filters.isActive ? "active" : "inactive"}
          onValueChange={handleStatusChange}
          disabled={isLoading}
        >
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
