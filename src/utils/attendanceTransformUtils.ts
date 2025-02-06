
import type { AttendanceRecord, DailyAttendanceRecord } from "@/types/attendance";

export const transformAttendanceRecords = (records: AttendanceRecord[]): DailyAttendanceRecord[] => {
  if (!Array.isArray(records) || records.length === 0) {
    console.log('No records to transform');
    return [];
  }

  try {
    console.log('Starting records transformation with:', records);
    
    // Group records by date
    const groupedByDate = records.reduce((acc, record) => {
      if (!record.date) {
        console.warn('Record missing date:', record);
        return acc;
      }

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
      
      // Add record to the day's records
      acc[date].records.push(record);
      
      // Update stats
      if (record.status) {
        acc[date].stats[record.status as keyof typeof acc[typeof date]['stats']]++;
        acc[date].stats.total++;
      }
      
      return acc;
    }, {} as Record<string, DailyAttendanceRecord>);

    console.log('Grouped by date:', groupedByDate);
    
    // Convert to array and sort by date (most recent first)
    const result = Object.values(groupedByDate).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    console.log('Final transformed records:', result);
    return result;
  } catch (error) {
    console.error('Error transforming attendance records:', error);
    return [];
  }
};
