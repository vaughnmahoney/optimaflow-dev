
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAttendanceState } from "@/hooks/useAttendanceState";
import { useGroupReview } from "@/hooks/useGroupReview";
import type { Technician } from "@/types/attendance";

export const useGroupAttendance = (groupId: string, technicians: Technician[]) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { updateSubmissionStatus } = useGroupReview(groupId);
  
  const {
    attendanceStates,
    updateStatus,
    initializeStates,
    submitDailyAttendance,
    isSubmitting,
  } = useAttendanceState(technicians);

  // Query to check if this group has submitted attendance for today
  const { data: submissionStatus } = useQuery({
    queryKey: ['group-review', groupId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('group_attendance_review')
        .select('*')
        .eq('group_id', groupId)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const hasSubmittedToday = submissionStatus?.is_submitted || false;

  useEffect(() => {
    if (technicians.length > 0) {
      checkTodaySubmission();
    }
  }, [technicians, submissionStatus]);

  const checkTodaySubmission = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data: existingRecords } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("date", today);

    if (existingRecords && existingRecords.length > 0) {
      const states = existingRecords.map((record: any) => ({
        technicianId: record.technician_id,
        status: record.status,
      }));
      initializeStates(states);
    } else {
      initializeStates();
    }
  };

  const handleSubmit = async () => {
    const unsetTechnicians = technicians.filter(
      tech => !attendanceStates.find(state => state.technicianId === tech.id)?.status
    );

    if (unsetTechnicians.length) {
      toast({
        title: "Missing Attendance",
        description: "Please mark attendance for all technicians before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitDailyAttendance();
      await updateSubmissionStatus.mutateAsync(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    checkTodaySubmission();
  };

  return {
    isEditing,
    hasSubmittedToday,
    attendanceStates,
    isSubmitting,
    updateStatus,
    handleSubmit,
    handleEdit,
    handleCancelEdit,
  };
};
