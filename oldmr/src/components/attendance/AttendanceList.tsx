import { format } from "date-fns";
import { AttendanceRadioCard } from "./AttendanceRadioCard";
import type { AttendanceRecord, Technician } from "@/types/attendance";

interface AttendanceListProps {
  technicians: Technician[];
  todayAttendance: AttendanceRecord[];
  onStatusChange: (technicianId: string, status: AttendanceRecord["status"]) => void;
  isSubmitting: boolean;
  date: Date;
  isEditable?: boolean;
}

export const AttendanceList = ({
  technicians,
  todayAttendance,
  onStatusChange,
  isSubmitting,
  date,
  isEditable = false,
}: AttendanceListProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">
            Attendance for {format(date, "EEEE, MMMM d, yyyy")}
          </h3>
          {isEditable && (
            <p className="text-sm text-gray-500">
              Edit attendance records using the radio buttons below
            </p>
          )}
        </div>

        <div className="space-y-4">
          {technicians.map((tech) => {
            const record = todayAttendance.find(
              (record) => record.technician_id === tech.id
            );

            return (
              <AttendanceRadioCard
                key={tech.id}
                technician={tech}
                currentStatus={record?.status || null}
                onStatusChange={(status) => onStatusChange(tech.id, status)}
                isSubmitting={isSubmitting}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};