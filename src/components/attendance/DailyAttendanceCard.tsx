import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AttendanceList } from "./AttendanceList";
import { AttendanceStats } from "./AttendanceStats";
import { DailyAttendanceHeader } from "./DailyAttendanceHeader";
import { DailyAttendanceList } from "./DailyAttendanceList";
import type { DailyAttendanceRecord, Technician } from "@/types/attendance";

interface DailyAttendanceCardProps {
  record: DailyAttendanceRecord;
  technicians: Technician[];
  editingDate: string | null;
  isSubmitting: boolean;
  onEdit: (date: string) => void;
  onStatusChange: (technicianId: string, status: "present" | "absent" | "excused", date: string) => void;
  getTechnicianName: (technicianId: string) => string;
}

export const DailyAttendanceCard = ({
  record,
  technicians,
  editingDate,
  isSubmitting,
  onEdit,
  onStatusChange,
  getTechnicianName,
}: DailyAttendanceCardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!record || !record.records || record.records.length === 0) {
    return null;
  }

  const isToday = record.date === new Date().toISOString().split('T')[0];
  const isEditing = editingDate === record.date;

  const filteredRecords = record.records.filter(attendance => {
    const technicianName = getTechnicianName(attendance.technician_id).toLowerCase();
    return technicianName.includes(searchQuery.toLowerCase());
  });

  if (isEditing) {
    return (
      <Card>
        <AttendanceList
          technicians={technicians}
          todayAttendance={record.records}
          onStatusChange={(techId, status) =>
            onStatusChange(techId, status, record.date)
          }
          isSubmitting={isSubmitting}
          date={new Date(record.date)}
          isEditable={true}
        />
      </Card>
    );
  }

  return (
    <Card>
      <DailyAttendanceHeader
        date={record.date}
        isToday={isToday}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onEdit={() => onEdit(record.date)}
      />
      <CardContent>
        <AttendanceStats stats={record.stats} />
        <DailyAttendanceList
          records={filteredRecords}
          getTechnicianName={getTechnicianName}
        />
      </CardContent>
    </Card>
  );
};