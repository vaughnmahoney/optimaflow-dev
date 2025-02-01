import { type AttendanceRecord, type Technician } from "@/types/attendance";
import { supabase } from "@/integrations/supabase/client";

export type AttendanceStatus = AttendanceRecord["status"];

export interface AttendanceState {
  technicianId: string;
  status: AttendanceStatus | null;
  isSubmitting: boolean;
}

export const createAttendanceRecords = (
  attendanceStates: AttendanceState[],
  supervisorId: string,
  date: string
) => {
  return attendanceStates
    .filter(state => state.status !== null)
    .map((state) => ({
      technician_id: state.technicianId,
      supervisor_id: supervisorId,
      date,
      status: state.status,
      updated_at: new Date().toISOString(),
    }));
};

export const submitAttendanceRecords = async (records: any[]) => {
  const { error } = await supabase
    .from("attendance_records")
    .upsert(records, {
      onConflict: 'technician_id,date',
      ignoreDuplicates: false,
    });

  if (error) throw error;
};