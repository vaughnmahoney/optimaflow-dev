import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { type AttendanceRecord, type Technician } from "@/types/attendance";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type AttendanceStatus = AttendanceRecord["status"];

interface AttendanceState {
  technicianId: string;
  status: AttendanceStatus | null;
  isSubmitting: boolean;
}

export const useAttendanceState = (technicians: Technician[]) => {
  const [attendanceStates, setAttendanceStates] = useState<AttendanceState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize states for all technicians
  const initializeStates = () => {
    const initialStates = technicians.map((tech) => ({
      technicianId: tech.id,
      status: null,
      isSubmitting: false,
    }));
    setAttendanceStates(initialStates);
  };

  // Update status for a specific technician
  const updateStatus = async (technicianId: string, newStatus: AttendanceStatus) => {
    // Prevent rapid status changes
    const existingState = attendanceStates.find(
      (state) => state.technicianId === technicianId
    );
    if (existingState?.isSubmitting) {
      toast({
        title: "Please wait",
        description: "Previous status update is still processing",
        variant: "destructive",
      });
      return;
    }

    // Update local state with new status
    setAttendanceStates((prev) =>
      prev.map((state) =>
        state.technicianId === technicianId
          ? { ...state, status: newStatus }
          : state
      )
    );
  };

  // Submit all attendance records for the day
  const submitDailyAttendance = async () => {
    try {
      setIsSubmitting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const today = new Date().toISOString().split("T")[0];
      
      // Create attendance records for all technicians
      const records = attendanceStates.map((state) => ({
        technician_id: state.technicianId,
        supervisor_id: session.user.id,
        date: today,
        status: state.status,
        submitted_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("attendance_records")
        .upsert(records);

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["attendance"] });

    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast({
        title: "Error",
        description: "Failed to submit attendance records. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    attendanceStates,
    updateStatus,
    initializeStates,
    submitDailyAttendance,
    isSubmitting,
  };
};