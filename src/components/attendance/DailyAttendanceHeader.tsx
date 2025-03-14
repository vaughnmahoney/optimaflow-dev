
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
    <div className="p-5 border-b border-gray-100">
      <div className="grid grid-cols-3 items-center mb-4">
        {/* Search on left */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by technician name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 max-w-[250px]"
          />
          <SearchIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
        </div>
        
        {/* Date in middle */}
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {format(parseISO(date), "EEEE, MMMM d, yyyy")}
          </h3>
          {isToday && (
            <span className="text-sm text-primary font-medium">Today</span>
          )}
        </div>
        
        {/* Edit button on right */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};
