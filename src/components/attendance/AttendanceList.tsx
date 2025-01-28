import { type AttendanceRecord, type Technician } from "@/types/attendance";
import { AttendanceCard } from "./AttendanceCard";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface AttendanceListProps {
  technicians: Technician[];
  todayAttendance?: AttendanceRecord[];
  onStatusChange: (technicianId: string, status: AttendanceRecord["status"]) => void;
  onSubmit?: () => void;
  isSubmitting: boolean;
  date?: Date;
  isEditable?: boolean;
}

export const AttendanceList = ({
  technicians,
  todayAttendance,
  onStatusChange,
  onSubmit,
  isSubmitting,
  date = new Date(),
  isEditable = true,
}: AttendanceListProps) => {
  const allMarked = technicians.every(tech => 
    todayAttendance?.find(record => record.technician_id === tech.id)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Attendance for {format(date, "EEEE, MMMM d, yyyy")}</h3>
          <p className="text-sm text-gray-500">
            {isEditable 
              ? "Mark attendance for your team" 
              : "Attendance has been submitted for today"}
          </p>
        </div>
        {isEditable && onSubmit && (
          <Button 
            onClick={onSubmit} 
            disabled={isSubmitting || !allMarked}
          >
            {isSubmitting ? "Submitting..." : "Submit Attendance"}
          </Button>
        )}
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
            isEditable={isEditable}
          />
        ))}
      </div>
    </div>
  );
};