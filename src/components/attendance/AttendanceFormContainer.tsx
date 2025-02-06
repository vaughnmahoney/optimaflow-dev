
import { useEffect, useState } from "react";
import { useAttendance } from "@/hooks/useAttendance";
import { useAttendanceState } from "@/hooks/useAttendanceState";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceForm } from "./AttendanceForm";
import { useGroupReview } from "@/hooks/useGroupReview";

interface AttendanceFormContainerProps {
  groupId: string;
}

export const AttendanceFormContainer = ({ groupId }: AttendanceFormContainerProps) => {
  const { technicians, isLoadingTechnicians } = useAttendance(groupId);
  const { toast } = useToast();
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
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

  useEffect(() => {
    if (technicians) {
      checkTodaySubmission();
    }
  }, [technicians]);

  const checkTodaySubmission = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data: existingRecords } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("date", today);

    setHasSubmittedToday(existingRecords && existingRecords.length > 0);
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
      await checkTodaySubmission();
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
