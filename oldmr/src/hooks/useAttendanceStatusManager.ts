
import { useState, useCallback } from "react";
import type { AttendanceState, AttendanceStatus } from "@/types/attendanceTypes";

export const useAttendanceStatusManager = () => {
  const [attendanceStates, setAttendanceStates] = useState<AttendanceState[]>([]);

  const updateStatus = useCallback((technicianId: string, newStatus: AttendanceStatus) => {
    setAttendanceStates((prev) =>
      prev.map((state) =>
        state.technicianId === technicianId
          ? { ...state, status: newStatus }
          : state
      )
    );
  }, []);

  const initializeStates = useCallback((
    technicianIds: string[],
    existingStates?: { technicianId: string; status: AttendanceStatus }[]
  ) => {
    const initialStates = technicianIds.map((id) => ({
      technicianId: id,
      status: existingStates?.find(state => state.technicianId === id)?.status || null,
      isSubmitting: false,
    }));
    setAttendanceStates(initialStates);
  }, []);

  return {
    attendanceStates,
    updateStatus,
    initializeStates,
  };
};

