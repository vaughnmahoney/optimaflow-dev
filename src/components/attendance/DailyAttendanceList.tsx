
import type { DailyAttendanceRecord } from "@/types/attendance";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-2.5">
      {records.map((attendance) => (
        <div
          key={attendance.id}
          className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100"
        >
          <span className="font-medium text-gray-800">
            {getTechnicianName(attendance.technician_id)}
          </span>
          <Badge
            variant={
              attendance.status === "present"
                ? "success"
                : attendance.status === "absent"
                ? "destructive"
                : "warning"
            }
            className="px-3 py-1 text-xs font-medium"
          >
            {attendance.status.charAt(0).toUpperCase() +
              attendance.status.slice(1)}
          </Badge>
        </div>
      ))}
    </div>
  );
};
