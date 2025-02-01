import type { AttendanceRecord, DailyAttendanceRecord } from "@/types/attendance";

export const transformAttendanceRecords = (records: AttendanceRecord[]): DailyAttendanceRecord[] => {
  console.log('Starting records transformation with:', records);
  if (!Array.isArray(records)) {
    console.error('Records is not an array:', records);
    return [];
  }

  const groupedByDate = records.reduce((acc, record) => {
    console.log('Processing record:', record);
    const date = record.date;
    if (!acc[date]) {
      acc[date] = {
        id: date,
        date,
        records: [],
        submittedBy: record.supervisor_id,
        submittedAt: record.submitted_at || '',
        stats: { present: 0, absent: 0, excused: 0, total: 0 }
      };
    }
    acc[date].records.push(record);
    acc[date].stats[record.status as keyof typeof acc[typeof date]['stats']]++;
    acc[date].stats.total++;
    return acc;
  }, {} as Record<string, DailyAttendanceRecord>);

  console.log('Grouped by date:', groupedByDate);
  const result = Object.values(groupedByDate).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  console.log('Final transformed records:', result);
  return result;
};