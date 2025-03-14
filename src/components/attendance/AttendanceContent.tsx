
import { Card, CardContent } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { YearGroup } from "./YearGroup";
import { transformAttendanceRecords } from "@/utils/attendanceTransformUtils";
import { groupAttendanceRecords } from "@/utils/attendanceUtils";
import type { Technician, AttendanceRecord } from "@/types/attendance";

interface AttendanceContentProps {
  records: AttendanceRecord[];
  technicians: Technician[];
  editingDate: string | null;
  isSubmitting: boolean;
  onEdit: (date: string) => void;
  onStatusChange: (technicianId: string, status: "present" | "absent" | "excused", date: string) => void;
  getTechnicianName: (technicianId: string) => string;
}

export const AttendanceContent = ({
  records,
  technicians,
  editingDate,
  isSubmitting,
  onEdit,
  onStatusChange,
  getTechnicianName,
}: AttendanceContentProps) => {
  console.log('Raw attendance records:', records);
  const dailyRecords = transformAttendanceRecords(records);
  console.log('Transformed daily records:', dailyRecords);
  
  const groupedRecords = groupAttendanceRecords(dailyRecords);
  console.log('Grouped records by year/month:', groupedRecords);

  if (groupedRecords.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-8">
          <p className="text-center text-gray-500 font-medium">
            No attendance records found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Attendance History</h3>
      <Accordion type="single" collapsible className="space-y-6">
        {groupedRecords.map((yearGroup) => (
          <YearGroup
            key={yearGroup.year}
            year={yearGroup.year}
            months={yearGroup.months}
            records={dailyRecords}
            technicians={technicians}
            editingDate={editingDate}
            isSubmitting={isSubmitting}
            onEdit={onEdit}
            onStatusChange={onStatusChange}
            getTechnicianName={getTechnicianName}
          />
        ))}
      </Accordion>
    </div>
  );
};
