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
  phone: string;
  supervisorId: string;
  createdAt: Date;
}

export interface AttendanceRecord {
  id: string;
  technicianId: string;
  supervisorId: string;
  date: Date;
  status: "present" | "absent" | "excused";
  note?: string;
  submittedAt: Date;
  updatedAt?: Date;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  excused: number;
  total: number;
}

export interface DailyAttendanceRecord {
  id: string;
  date: Date;
  records: AttendanceRecord[];
  submittedBy: string;
  submittedAt: Date;
  stats: AttendanceStats;
}