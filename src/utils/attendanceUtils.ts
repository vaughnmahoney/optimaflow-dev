import { DailyAttendanceRecord, type AttendanceRecord } from "@/types/attendance";
import { format, getWeek, startOfWeek, endOfWeek, parseISO } from "date-fns";

interface WeekGroup {
  weekNumber: number;
  startDate: string;
  endDate: string;
  records: DailyAttendanceRecord[];
}

interface MonthGroup {
  month: string;
  weeks: WeekGroup[];
}

interface YearGroup {
  year: string;
  months: MonthGroup[];
}

export const getStatusColor = (status: AttendanceRecord["status"]) => {
  switch (status) {
    case "present":
      return "bg-green-100 text-green-800 border-green-200";
    case "absent":
      return "bg-red-100 text-red-800 border-red-200";
    case "excused":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const groupAttendanceRecords = (records: DailyAttendanceRecord[]): YearGroup[] => {
  const sortedRecords = [...records].sort((a, b) => 
    parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );
  
  const yearGroups = new Map<string, Map<string, Map<number, DailyAttendanceRecord[]>>>();

  sortedRecords.forEach(record => {
    const date = parseISO(record.date);
    const year = format(date, "yyyy");
    const month = format(date, "MMMM");
    const weekNumber = getWeek(date);

    if (!yearGroups.has(year)) {
      yearGroups.set(year, new Map());
    }
    const yearGroup = yearGroups.get(year)!;

    if (!yearGroup.has(month)) {
      yearGroup.set(month, new Map());
    }
    const monthGroup = yearGroup.get(month)!;

    if (!monthGroup.has(weekNumber)) {
      monthGroup.set(weekNumber, []);
    }
    monthGroup.get(weekNumber)!.push(record);
  });

  return Array.from(yearGroups.entries()).map(([year, months]) => ({
    year,
    months: Array.from(months.entries()).map(([month, weeks]) => ({
      month,
      weeks: Array.from(weeks.entries()).map(([weekNumber, records]) => {
        const firstDate = parseISO(records[0].date);
        return {
          weekNumber,
          startDate: startOfWeek(firstDate).toISOString(),
          endDate: endOfWeek(firstDate).toISOString(),
          records,
        };
      }),
    })),
  }));
};