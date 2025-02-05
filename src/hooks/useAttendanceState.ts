
import { useMemo } from "react";
import type { Technician } from "@/types/attendance";
import { useAttendanceStatusManager } from "./useAttendanceStatusManager";
import { useAttendanceSubmission } from "./useAttendanceSubmission";

export const useAttendanceState = (technicians: Technician[]) => {
  const { attendanceStates, updateStatus, initializeStates } = useAttendanceStatusManager();
  const { isSubmitting, submitDailyAttendance } = useAttendanceSubmission();

  const handleSubmit = useMemo(() => async () => {
    await submitDailyAttendance(attendanceStates);
  }, [submitDailyAttendance, attendanceStates]);

  const initializeAttendanceStates = useMemo(() => (
    existingStates?: { technicianId: string; status: any }[]
  ) => {
    initializeStates(
      technicians.map(tech => tech.id),
      existingStates
    );
  }, [initializeStates, technicians]);

  return {
    attendanceStates,
    updateStatus,
    initializeStates: initializeAttendanceStates,
    submitDailyAttendance: handleSubmit,
    isSubmitting,
  };
};

