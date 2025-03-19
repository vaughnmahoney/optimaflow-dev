import type { DailyAttendanceRecord } from "./attendance";

export type AttendanceStatus = "present" | "absent" | "excused";

export interface AttendanceState {
  technicianId: string;
  status: AttendanceStatus | null;
  isSubmitting: boolean;
}

export interface WeekGroup {
  weekNumber: number;
  startDate: string;
  endDate: string;
  records: DailyAttendanceRecord[];
}

export interface MonthGroup {
  month: string;
  weeks: WeekGroup[];
  records: DailyAttendanceRecord[];
}

export interface YearGroup {
  year: string;
  months: MonthGroup[];
}