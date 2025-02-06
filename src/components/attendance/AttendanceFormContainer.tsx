
import { useState } from "react";
import { useAttendance } from "@/hooks/useAttendance";
import { AttendanceForm } from "./AttendanceForm";
import { useGroupAttendance } from "@/hooks/useGroupAttendance";

interface AttendanceFormContainerProps {
  groupId: string;
}

export const AttendanceFormContainer = ({ groupId }: AttendanceFormContainerProps) => {
  const { technicians, isLoadingTechnicians } = useAttendance(groupId);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    isEditing,
    hasSubmittedToday,
    attendanceStates,
    isSubmitting,
    updateStatus,
    handleSubmit,
    handleEdit,
    handleCancelEdit,
  } = useGroupAttendance(groupId, technicians || []);

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
