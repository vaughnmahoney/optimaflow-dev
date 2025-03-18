
import { AttendanceStats as AttendanceStatsType } from "@/types/attendance";

interface AttendanceStatsProps {
  stats: AttendanceStatsType;
}

export const AttendanceStats = ({ stats }: AttendanceStatsProps) => {
  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      <div className="text-center px-2 py-2.5 bg-gray-50 rounded-md border border-gray-100">
        <div className="text-xs font-medium text-gray-500 mb-1">Total</div>
        <div className="text-lg font-semibold text-gray-800">{stats.total}</div>
      </div>
      <div className="text-center px-2 py-2.5 bg-green-50 rounded-md border border-green-100">
        <div className="text-xs font-medium text-green-600 mb-1">Present</div>
        <div className="text-lg font-semibold text-green-700">{stats.present}</div>
      </div>
      <div className="text-center px-2 py-2.5 bg-red-50 rounded-md border border-red-100">
        <div className="text-xs font-medium text-red-600 mb-1">Absent</div>
        <div className="text-lg font-semibold text-red-700">{stats.absent}</div>
      </div>
      <div className="text-center px-2 py-2.5 bg-yellow-50 rounded-md border border-yellow-100">
        <div className="text-xs font-medium text-yellow-600 mb-1">Excused</div>
        <div className="text-lg font-semibold text-yellow-700">{stats.excused}</div>
      </div>
    </div>
  );
};
