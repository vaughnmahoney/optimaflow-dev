
import { useEffect, useState } from "react";
import { useAttendance } from "@/hooks/useAttendance";
import { useAttendanceState } from "@/hooks/useAttendanceState";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceForm } from "./AttendanceForm";
import { useGroupReview } from "@/hooks/useGroupReview";
import { useQuery } from "@tanstack/react-query";

interface AttendanceFormContainerProps {
  groupId: string;
}

export const AttendanceFormContainer = ({ groupId }: AttendanceFormContainerProps) => {
  const { technicians, isLoadingTechnicians } = useAttendance(groupId);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { updateSubmissionStatus } = useGroupReview(groupId);

  const {
    attendanceStates,
    updateStatus,
    initializeStates,
    submitDailyAttendance,
    isSubmitting,
  } = useAttendanceState(technicians || []);

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
    if (technicians) {
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
    const unsetTechnicians = technicians?.filter(
      tech => !attendanceStates.find(state => state.technicianId === tech.id)?.status
    );

    if (unsetTechnicians?.length) {
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

  return (
    <AttendanceForm
      technicians={technicians}
      isLoadingTechnicians={isLoadingTechnicians}
      hasSubmittedToday={hasSubmittedToday}
      isEditing={isEditing}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      attendanceStates={attendanceStates}
      updateStatus={updateStatus}
      isSubmitting={isSubmitting}
      onEdit={handleEdit}
      onSubmit={handleSubmit}
      onCancelEdit={handleCancelEdit}
    />
  );
};
