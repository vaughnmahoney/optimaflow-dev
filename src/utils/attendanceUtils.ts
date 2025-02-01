import { supabase } from "@/integrations/supabase/client";
import type { DailyAttendanceRecord } from "@/types/attendance";
import type { AttendanceState, WeekGroup, MonthGroup, YearGroup } from "@/types/attendanceTypes";
import { getWeekNumber, getWeekStart, getWeekEnd } from "./dateUtils";

export type { AttendanceState, AttendanceStatus } from "@/types/attendanceTypes";

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