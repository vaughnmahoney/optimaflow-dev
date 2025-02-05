
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createAttendanceRecords, submitAttendanceRecords } from "@/utils/attendanceUtils";
import type { AttendanceState } from "@/types/attendanceTypes";

export const useAttendanceSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitDailyAttendance = useCallback(async (attendanceStates: AttendanceState[]) => {
    try {
      setIsSubmitting(true);
      console.log('Starting attendance submission...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found during submission');
        throw new Error("No active session");
      }
      console.log('Session found for submission, user ID:', session.user.id);

      const today = new Date().toISOString().split("T")[0];
      console.log('Submitting attendance for date:', today);
      
      const records = createAttendanceRecords(attendanceStates, session.user.id, today);
      console.log('Created attendance records:', records);

      if (records.length === 0) {
        console.warn('No records to submit');
        toast({
          title: "No changes to submit",
          description: "Please mark attendance for at least one technician.",
          variant: "destructive",
        });
        return;
      }

      await submitAttendanceRecords(records);
      console.log('Successfully submitted attendance records');
      
      await queryClient.invalidateQueries({ queryKey: ["attendance"] });
      await queryClient.refetchQueries({ queryKey: ["attendance"] });
      console.log('Invalidated and refetched attendance queries');

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
  }, [toast, queryClient]);

  return {
    isSubmitting,
    submitDailyAttendance,
  };
};

