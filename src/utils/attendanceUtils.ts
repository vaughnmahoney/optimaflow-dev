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
  console.log('Starting grouping of records:', records);
  
  const groupedByYear = records.reduce((years, record) => {
    const date = new Date(record.date);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('default', { month: 'long' });
    const weekNumber = getWeekNumber(date);
    const weekStart = getWeekStart(date);
    const weekEnd = getWeekEnd(date);

    // Initialize year if it doesn't exist
    if (!years[year]) {
      years[year] = { 
        year, 
        months: {} 
      };
    }

    // Initialize month if it doesn't exist
    if (!years[year].months[month]) {
      years[year].months[month] = {
        month,
        weeks: [],
        records: [],
      };
    }

    // Add record to month's records array
    years[year].months[month].records.push(record);

    // Find or create week
    let week = years[year].months[month].weeks.find(w => w.weekNumber === weekNumber);
    if (!week) {
      week = {
        weekNumber,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        records: [],
      };
      years[year].months[month].weeks.push(week);
    }
    
    // Add record to week's records array
    week.records.push(record);

    return years;
  }, {} as Record<string, { year: string; months: Record<string, MonthGroup> }>);

  // Transform the nested objects into arrays and sort them
  const result = Object.entries(groupedByYear).map(([year, yearGroup]) => ({
    year,
    months: Object.values(yearGroup.months)
      .map(month => ({
        ...month,
        weeks: month.weeks.sort((a, b) => b.weekNumber - a.weekNumber),
      }))
      .sort((a, b) => {
        const monthA = new Date(Date.parse(`${a.month} 1, ${year}`));
        const monthB = new Date(Date.parse(`${b.month} 1, ${year}`));
        return monthB.getTime() - monthA.getTime();
      }),
  }))
  .sort((a, b) => parseInt(b.year) - parseInt(a.year));

  console.log('Final grouped records:', result);
  return result;
};