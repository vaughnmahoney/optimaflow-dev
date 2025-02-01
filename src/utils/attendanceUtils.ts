import { supabase } from "@/integrations/supabase/client";
import type { DailyAttendanceRecord } from "@/types/attendance";

export type AttendanceStatus = "present" | "absent" | "excused";

export interface AttendanceState {
  technicianId: string;
  status: AttendanceStatus | null;
  isSubmitting: boolean;
}

interface WeekGroup {
  weekNumber: number;
  startDate: string;
  endDate: string;
  records: DailyAttendanceRecord[];
}

interface MonthGroup {
  month: string;
  weeks: WeekGroup[];
  records: DailyAttendanceRecord[];
}

interface YearGroup {
  year: string;
  months: MonthGroup[];
}

export const createAttendanceRecords = (
  attendanceStates: AttendanceState[],
  supervisorId: string,
  date: string
) => {
  return attendanceStates
    .filter(state => state.status !== null)
    .map((state) => ({
      technician_id: state.technicianId,
      supervisor_id: supervisorId,
      date,
      status: state.status,
      updated_at: new Date().toISOString(),
    }));
};

export const submitAttendanceRecords = async (records: any[]) => {
  const { error } = await supabase
    .from("attendance_records")
    .upsert(records, {
      onConflict: 'technician_id,date',
      ignoreDuplicates: false,
    });

  if (error) throw error;
};

export const groupAttendanceRecords = (records: DailyAttendanceRecord[]): YearGroup[] => {
  const groupedByYear = records.reduce((years, record) => {
    const date = new Date(record.date);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('default', { month: 'long' });
    const weekNumber = getWeekNumber(date);
    const weekStart = getWeekStart(date);
    const weekEnd = getWeekEnd(date);

    if (!years[year]) {
      years[year] = { year, months: {} };
    }

    if (!years[year].months[month]) {
      years[year].months[month] = {
        month,
        weeks: [],
        records: [],
      };
    }

    // Add record to month
    years[year].months[month].records.push(record);

    // Add record to week
    let week = years[year].months[month].weeks.find(w => w.weekNumber === weekNumber);
    if (!week) {
      week = {
        weekNumber,
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        records: [],
      };
      years[year].months[month].weeks.push(week);
    }
    week.records.push(record);

    return years;
  }, {} as Record<string, { year: string; months: Record<string, MonthGroup> }>);

  return Object.values(groupedByYear)
    .map(yearGroup => ({
      year: yearGroup.year,
      months: Object.values(yearGroup.months)
        .map(month => ({
          ...month,
          weeks: month.weeks.sort((a, b) => b.weekNumber - a.weekNumber),
        }))
        .sort((a, b) => {
          const monthA = new Date(Date.parse(`${a.month} 1, 2000`));
          const monthB = new Date(Date.parse(`${b.month} 1, 2000`));
          return monthB.getTime() - monthA.getTime();
        }),
    }))
    .sort((a, b) => parseInt(b.year) - parseInt(a.year));
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
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  return new Date(d.setDate(diff));
};