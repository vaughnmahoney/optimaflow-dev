
import type { DailyAttendanceRecord } from "@/types/attendance";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DailyAttendanceListProps {
  records: DailyAttendanceRecord["records"];
  getTechnicianName: (technicianId: string) => string;
}

export const DailyAttendanceList = ({
  records,
  getTechnicianName,
}: DailyAttendanceListProps) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md border border-gray-200">
        No technicians found matching your search
      </div>
    );
  }

  return (
    <div className="space-y-2.5 p-2">
      {records.map((attendance) => (
        <div
          key={attendance.id}
          className="flex justify-between items-center p-3 bg-gray-50/70 rounded-md border border-gray-100"
        >
          <span className="font-medium text-gray-800 pl-2">
            {getTechnicianName(attendance.technician_id)}
          </span>
          <Badge
            className={cn(
              "px-4 py-1 text-xs font-medium",
              attendance.status === "present" 
                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                : attendance.status === "absent"
                ? "bg-red-100 text-red-800 hover:bg-red-200"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            )}
          >
            {attendance.status.charAt(0).toUpperCase() +
              attendance.status.slice(1)}
          </Badge>
        </div>
      ))}
    </div>
  );
};
