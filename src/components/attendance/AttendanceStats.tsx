import { type AttendanceRecord } from "@/types/attendance";
import { getStatusColor } from "@/utils/attendanceUtils";

interface AttendanceStatsProps {
  todayAttendance?: AttendanceRecord[];
}

export const AttendanceStats = ({ todayAttendance }: AttendanceStatsProps) => {
  const getAttendanceStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      excused: 0,
    };

    todayAttendance?.forEach((record) => {
      if (record.status in stats) {
        stats[record.status as keyof typeof stats]++;
      }
    });

    return stats;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(getAttendanceStats()).map(([status, count]) => (
          <div
            key={status}
            className={`p-4 rounded-lg border ${getStatusColor(
              status as AttendanceRecord["status"]
            )}`}
          >
            <p className="text-sm text-gray-600">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
            <p className="text-2xl font-semibold mt-1">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
};