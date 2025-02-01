import { DailyAttendanceRecord } from "@/types/attendance";

interface YearGroup {
  year: string;
  months: MonthGroup[];
}

interface MonthGroup {
  month: string;
  weeks: WeekGroup[];
}

interface WeekGroup {
  weekNumber: number;
  startDate: string;
  endDate: string;
  records: DailyAttendanceRecord[];
}

export const groupAttendanceRecords = (records: DailyAttendanceRecord[]): YearGroup[] => {
  const groupedByYear: { [key: string]: { [key: string]: DailyAttendanceRecord[] } } = {};

  // Sort records by date in descending order
  records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group records by year and month
  records.forEach(record => {
    const date = new Date(record.date);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('default', { month: 'long' });

    if (!groupedByYear[year]) {
      groupedByYear[year] = {};
    }
    if (!groupedByYear[year][month]) {
      groupedByYear[year][month] = [];
    }
    groupedByYear[year][month].push(record);
  });

  // Transform into the required format
  return Object.entries(groupedByYear).map(([year, months]) => ({
    year,
    months: Object.entries(months).map(([month, records]) => ({
      month,
      weeks: groupIntoWeeks(records),
    })),
  }));
};

const groupIntoWeeks = (records: DailyAttendanceRecord[]): WeekGroup[] => {
  const weeks: { [key: number]: WeekGroup } = {};

  records.forEach(record => {
    const date = new Date(record.date);
    const weekNumber = getWeekNumber(date);
    
    if (!weeks[weekNumber]) {
      weeks[weekNumber] = {
        weekNumber,
        startDate: getWeekStart(date).toISOString().split('T')[0],
        endDate: getWeekEnd(date).toISOString().split('T')[0],
        records: [],
      };
    }
    weeks[weekNumber].records.push(record);
  });

  return Object.values(weeks).sort((a, b) => b.weekNumber - a.weekNumber);
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getWeekEnd = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 7;
  return new Date(d.setDate(diff));
};