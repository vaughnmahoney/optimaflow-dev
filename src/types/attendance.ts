export type Role = "admin" | "supervisor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Technician {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  group_id: string | null;
  supervisor_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface AttendanceRecord {
  id: string;
  technician_id: string;
  supervisor_id: string;
  date: string;
  status: "present" | "absent" | "excused";
  note?: string | null;
  submitted_at: string | null;
  updated_at: string | null;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  excused: number;
  total: number;
}

export interface DailyAttendanceRecord {
  id: string;
  date: string;
  records: AttendanceRecord[];
  submittedBy: string;
  submittedAt: string;
  stats: AttendanceStats;
}