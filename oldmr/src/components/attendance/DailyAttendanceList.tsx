import type { DailyAttendanceRecord } from "@/types/attendance";

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
      <div className="text-center py-4 text-gray-500">
        No technicians found matching your search
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((attendance) => (
        <div
          key={attendance.id}
          className="flex justify-between items-center p-2 bg-gray-50 rounded"
        >
          <span className="font-medium">
            {getTechnicianName(attendance.technician_id)}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              attendance.status === "present"
                ? "bg-green-100 text-green-800"
                : attendance.status === "absent"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {attendance.status.charAt(0).toUpperCase() +
              attendance.status.slice(1)}
          </span>
        </div>
      ))}
    </div>
  );
};