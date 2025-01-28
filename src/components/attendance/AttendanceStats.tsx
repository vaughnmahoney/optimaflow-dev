import React from 'react';
import { AttendanceStats as StatsType } from '@/types/attendance';

interface AttendanceStatsProps {
  stats: StatsType;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="text-center p-3 bg-green-100 rounded-lg">
        <p className="text-sm text-gray-600">Present</p>
        <p className="text-xl font-bold text-green-600">
          {stats.present}
        </p>
      </div>
      <div className="text-center p-3 bg-red-100 rounded-lg">
        <p className="text-sm text-gray-600">Absent</p>
        <p className="text-xl font-bold text-red-600">
          {stats.absent}
        </p>
      </div>
      <div className="text-center p-3 bg-yellow-100 rounded-lg">
        <p className="text-sm text-gray-600">Excused</p>
        <p className="text-xl font-bold text-yellow-600">
          {stats.excused}
        </p>
      </div>
    </div>
  );
};