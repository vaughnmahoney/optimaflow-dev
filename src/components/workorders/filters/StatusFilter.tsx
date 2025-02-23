
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
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="pending_review">Pending Review</SelectItem>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="flagged">Flagged</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
      </SelectContent>
    </Select>
  );
};
