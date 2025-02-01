import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { type Technician } from "@/types/attendance";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAttendanceStateManager } from "./useAttendanceStateManager";
import { createAttendanceRecords, submitAttendanceRecords } from "@/utils/attendanceUtils";

export const useAttendanceState = (technicians: Technician[]) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { attendanceStates, updateStatus, initializeStates } = useAttendanceStateManager(technicians);

  const submitDailyAttendance = async () => {
    try {
      setIsSubmitting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const today = new Date().toISOString().split("T")[0];
      const records = createAttendanceRecords(attendanceStates, session.user.id, today);

      if (records.length === 0) {
        toast({
          title: "No changes to submit",
          description: "Please mark attendance for at least one technician.",
          variant: "destructive",
        });
        return;
      }

      await submitAttendanceRecords(records);
      queryClient.invalidateQueries({ queryKey: ["attendance"] });

      toast({
        title: "Success",
        description: "Attendance records have been saved successfully.",
      });

    } catch (error: any) {
      console.error("Error submitting attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit attendance records. Please try again.",
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