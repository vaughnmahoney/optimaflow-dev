import { DailyAttendanceRecord } from "@/types/attendance";
import { format, getWeek, startOfWeek, endOfWeek } from "date-fns";

interface WeekGroup {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
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

export const groupAttendanceRecords = (records: DailyAttendanceRecord[]): YearGroup[] => {
  const sortedRecords = [...records].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const yearGroups = new Map<string, Map<string, Map<number, DailyAttendanceRecord[]>>>();

  sortedRecords.forEach(record => {
    const year = format(record.date, "yyyy");
    const month = format(record.date, "MMMM");
    const weekNumber = getWeek(record.date);

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
      weeks: Array.from(weeks.entries()).map(([weekNumber, records]) => ({
        weekNumber,
        startDate: startOfWeek(records[0].date),
        endDate: endOfWeek(records[0].date),
        records,
      })),
    })),
  }));
};