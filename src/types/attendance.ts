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
  email: string;
  phone: string | null;
  supervisor_id: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  technician_id: string;
  supervisor_id: string;
  date: string;
  status: "present" | "absent" | "excused";
  note?: string | null;
  submitted_at: string;
  updated_at: string;
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