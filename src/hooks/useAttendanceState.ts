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

    try {
      // Update local state to show loading
      setAttendanceStates((prev) =>
        prev.map((state) =>
          state.technicianId === technicianId
            ? { ...state, isSubmitting: true }
            : state
        )
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const today = new Date().toISOString().split("T")[0];
      
      // Update attendance record
      const { error } = await supabase
        .from("attendance_records")
        .upsert({
          technician_id: technicianId,
          supervisor_id: session.user.id,
          date: today,
          status: newStatus,
          submitted_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update local state with new status
      setAttendanceStates((prev) =>
        prev.map((state) =>
          state.technicianId === technicianId
            ? { ...state, status: newStatus, isSubmitting: false }
            : state
        )
      );

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["attendance"] });

      toast({
        title: "Success",
        description: "Attendance status updated successfully",
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Error",
        description: "Failed to update attendance status. Please try again.",
        variant: "destructive",
      });

      // Reset submitting state on error
      setAttendanceStates((prev) =>
        prev.map((state) =>
          state.technicianId === technicianId
            ? { ...state, isSubmitting: false }
            : state
        )
      );
    }
  };

  return {
    attendanceStates,
    updateStatus,
    initializeStates,
  };
};