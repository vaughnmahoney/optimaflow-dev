
import { AttendanceRadioCard } from "./AttendanceRadioCard";
import type { Technician } from "@/types/attendance";
import type { AttendanceRecord } from "@/types/attendance";

interface TechnicianListProps {
  technicians: Technician[];
  attendanceStates: Array<{ technicianId: string; status: AttendanceRecord["status"] | null }>;
  updateStatus: (technicianId: string, status: AttendanceRecord["status"]) => void;
  isSubmitting: boolean;
  hasSubmittedToday: boolean;
  isEditing: boolean;
}

export const TechnicianList = ({
  technicians,
  attendanceStates,
  updateStatus,
  isSubmitting,
  hasSubmittedToday,
  isEditing,
}: TechnicianListProps) => {
  if (technicians.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No technicians found matching your search
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {technicians.map((tech) => {
        const state = attendanceStates.find(
          (state) => state.technicianId === tech.id
        );

        return (
          <AttendanceRadioCard
            key={tech.id}
            technician={tech}
            currentStatus={state?.status || null}
            onStatusChange={(status) => updateStatus(tech.id, status)}
            isSubmitting={isSubmitting}
            isDisabled={hasSubmittedToday && !isEditing}
          />
        );
      })}
    </div>
  );
};
