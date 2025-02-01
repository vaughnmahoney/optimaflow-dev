import { useState } from "react";
import type { Technician } from "@/types/attendance";
import type { AttendanceState, AttendanceStatus } from "@/utils/attendanceUtils";

export const useAttendanceStateManager = (technicians: Technician[]) => {
  const [attendanceStates, setAttendanceStates] = useState<AttendanceState[]>([]);

  const initializeStates = (existingStates?: { technicianId: string; status: AttendanceStatus }[]) => {
    const initialStates = technicians.map((tech) => ({
      technicianId: tech.id,
      status: existingStates?.find(state => state.technicianId === tech.id)?.status || null,
      isSubmitting: false,
    }));
    setAttendanceStates(initialStates);
  };

  const updateStatus = (technicianId: string, newStatus: AttendanceStatus) => {
    setAttendanceStates((prev) =>
      prev.map((state) =>
        state.technicianId === technicianId
          ? { ...state, status: newStatus }
          : state
      )
    );
  };

  return {
    attendanceStates,
    initializeStates,
    updateStatus,
  };
};