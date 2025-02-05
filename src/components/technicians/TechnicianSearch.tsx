
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

interface TechnicianSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TechnicianSearch = ({ searchQuery, setSearchQuery }: TechnicianSearchProps) => {
  return (
    <div className="relative mb-6">
      <Input
        type="text"
        placeholder="Search technicians by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
      <SearchIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
    </div>
  );
};
