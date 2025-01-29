import { AttendanceRecord, AttendanceStats } from "@/types/attendance";

export const calculateAttendanceStats = (records: AttendanceRecord[] = []): AttendanceStats => {
  const stats = {
    present: 0,
    absent: 0,
    excused: 0,
    total: records.length
  };

  records.forEach(record => {
    if (record.status === 'present') stats.present++;
    else if (record.status === 'absent') stats.absent++;
    else if (record.status === 'excused') stats.excused++;
  });

  return stats;
};

export const validateAttendanceSubmission = (records: AttendanceRecord[], technicianCount: number): boolean => {
  return records.length === technicianCount;
};