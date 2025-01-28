import { type AttendanceRecord, type Technician } from "@/types/attendance";
import { AttendanceCard } from "./AttendanceCard";
import { Button } from "@/components/ui/button";

interface AttendanceListProps {
  technicians: Technician[];
  todayAttendance?: AttendanceRecord[];
  onStatusChange: (technicianId: string, status: AttendanceRecord["status"]) => void;
  isSubmitting: boolean;
}

export const AttendanceList = ({
  technicians,
  todayAttendance,
  onStatusChange,
  isSubmitting,
}: AttendanceListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Today's Attendance</h3>
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Attendance"}
        </Button>
      </div>

      <div className="space-y-4">
        {technicians.map((tech) => (
          <AttendanceCard
            key={tech.id}
            technician={tech}
            todayRecord={todayAttendance?.find(
              (record) => record.technician_id === tech.id
            )}
            onStatusChange={onStatusChange}
            isSubmitting={isSubmitting}
          />
        ))}
      </div>
    </div>
  );
};