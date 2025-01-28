import { type AttendanceRecord, type Technician } from "@/types/attendance";
import { getStatusColor } from "@/utils/attendanceUtils";

interface AttendanceCardProps {
  technician: Technician;
  todayRecord?: AttendanceRecord;
  onStatusChange: (technicianId: string, status: AttendanceRecord["status"]) => void;
  isSubmitting: boolean;
  isEditable?: boolean;
}

export const AttendanceCard = ({
  technician,
  todayRecord,
  onStatusChange,
  isSubmitting,
  isEditable = true,
}: AttendanceCardProps) => {
  return (
    <div className="p-4 rounded-lg border bg-gray-50/50 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{technician.name}</h4>
          <p className="text-sm text-gray-500">{technician.email}</p>
        </div>
        <div className="flex gap-2">
          {["present", "absent", "excused"].map((status) => (
            <button
              key={status}
              onClick={() =>
                onStatusChange(
                  technician.id,
                  status as AttendanceRecord["status"]
                )
              }
              disabled={isSubmitting || (!isEditable && !!todayRecord)}
              className={`px-4 py-2 rounded-md border transition-colors ${
                todayRecord?.status === status
                  ? getStatusColor(status as AttendanceRecord["status"])
                  : "hover:bg-gray-100"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};