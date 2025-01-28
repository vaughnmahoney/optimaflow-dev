import React from 'react';
import { AttendanceStats as StatsType } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface AttendanceStatsProps {
  stats: StatsType;
  isDraft?: boolean;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ 
  stats,
  isDraft = false
}) => {
  if (!stats) return null;

  const baseClasses = "text-center p-3 rounded-lg transition-opacity duration-200";

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className={cn(
        baseClasses,
        "bg-green-100",
        isDraft && "opacity-60"
      )}>
        <p className="text-sm text-gray-600">Present</p>
        <p className="text-xl font-bold text-green-600">
          {stats.present}
        </p>
      </div>
      <div className={cn(
        baseClasses,
        "bg-red-100",
        isDraft && "opacity-60"
      )}>
        <p className="text-sm text-gray-600">Absent</p>
        <p className="text-xl font-bold text-red-600">
          {stats.absent}
        </p>
      </div>
      <div className={cn(
        baseClasses,
        "bg-yellow-100",
        isDraft && "opacity-60"
      )}>
        <p className="text-sm text-gray-600">Excused</p>
        <p className="text-xl font-bold text-yellow-600">
          {stats.excused}
        </p>
      </div>
    </div>
  );
};