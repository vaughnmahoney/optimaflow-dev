
import type { Technician } from "@/types/attendance";
import { useAttendanceStatusManager } from "./useAttendanceStatusManager";
import { useAttendanceSubmission } from "./useAttendanceSubmission";

export const useAttendanceState = (technicians: Technician[]) => {
  const { attendanceStates, updateStatus, initializeStates } = useAttendanceStatusManager();
  const { isSubmitting, submitDailyAttendance } = useAttendanceSubmission();

  const handleSubmit = async () => {
    await submitDailyAttendance(attendanceStates);
  };

  const initializeAttendanceStates = (
    existingStates?: { technicianId: string; status: any }[]
  ) => {
    initializeStates(
      technicians.map(tech => tech.id),
      existingStates
    );
  };

  return {
    attendanceStates,
    updateStatus,
    initializeStates: initializeAttendanceStates,
    submitDailyAttendance: handleSubmit,
    isSubmitting,
  };
};
