
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import React from "react";

interface SidebarSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export function SidebarSearch({ searchTerm, setSearchTerm, searchInputRef }: SidebarSearchProps) {
  return (
    <div className="p-3 border-b border-sidebar-border">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-icon" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search menu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 h-9 bg-sidebar-hover/50 text-sidebar-text placeholder:text-sidebar-icon border-sidebar-border"
        />
      </div>
    </div>
  );
}
