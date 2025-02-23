
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusFilterProps {
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
}

export const StatusFilter = ({
  statusFilter,
  onStatusFilterChange,
}: StatusFilterProps) => {
  return (
    <Select
      value={statusFilter || "all"}
      onValueChange={(value) => onStatusFilterChange(value === "all" ? null : value)}
    >
      <SelectTrigger className="w-[180px] h-10 bg-white/50 backdrop-blur-sm border-border/50 
                               shadow-sm transition-all duration-200 hover:bg-white/80 focus:bg-white 
                               focus:shadow-md rounded-lg">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent className="bg-white/90 backdrop-blur-sm border-border/50 shadow-lg">
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="pending_review">Pending Review</SelectItem>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="flagged">Flagged</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
      </SelectContent>
    </Select>
  );
};
