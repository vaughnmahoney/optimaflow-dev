import { AttendanceStats as AttendanceStatsType } from "@/types/attendance";

interface AttendanceStatsProps {
  stats: AttendanceStatsType;
}

export const AttendanceStats = ({ stats }: AttendanceStatsProps) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <div className="text-center p-2 bg-gray-50 rounded">
        <div className="text-sm font-medium text-gray-500">Total</div>
        <div className="text-lg font-semibold">{stats.total}</div>
      </div>
      <div className="text-center p-2 bg-green-50 rounded">
        <div className="text-sm font-medium text-green-600">Present</div>
        <div className="text-lg font-semibold text-green-700">{stats.present}</div>
      </div>
      <div className="text-center p-2 bg-red-50 rounded">
        <div className="text-sm font-medium text-red-600">Absent</div>
        <div className="text-lg font-semibold text-red-700">{stats.absent}</div>
      </div>
      <div className="text-center p-2 bg-yellow-50 rounded">
        <div className="text-sm font-medium text-yellow-600">Excused</div>
        <div className="text-lg font-semibold text-yellow-700">{stats.excused}</div>
      </div>
    </div>
  );
};