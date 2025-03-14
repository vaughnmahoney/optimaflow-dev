import { format, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { PencilIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DailyAttendanceHeaderProps {
  date: string;
  isToday: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onEdit: () => void;
}

export const DailyAttendanceHeader = ({
  date,
  isToday,
  searchQuery,
  onSearchChange,
  onEdit,
}: DailyAttendanceHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">
          {format(parseISO(date), "EEEE, MMMM d, yyyy")}
        </h3>
        {isToday && (
          <span className="text-sm text-primary font-medium">Today</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="gap-2"
      >
        <PencilIcon className="h-4 w-4" />
        Edit
      </Button>
      <div className="mt-4 relative">
        <Input
          type="text"
          placeholder="Search by technician name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        <SearchIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
      </div>
    </div>
  );
};