import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendance } from "@/hooks/useAttendance";
import { useAttendanceState } from "@/hooks/useAttendanceState";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TechnicianSearch } from "./TechnicianSearch";
import { AttendanceFormHeader } from "./AttendanceFormHeader";
import { TechnicianList } from "./TechnicianList";
import { AttendanceFormActions } from "./AttendanceFormActions";

interface AttendanceFormProps {
  groupId: string;
}

export const AttendanceForm = ({ groupId }: AttendanceFormProps) => {
  const { technicians, isLoadingTechnicians } = useAttendance(groupId);
  const { toast } = useToast();
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

    await submitDailyAttendance();
    await checkTodaySubmission();
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    checkTodaySubmission();
  };

  const filteredTechnicians = technicians?.filter(tech => 
    tech.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoadingTechnicians || !technicians) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg border">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <AttendanceFormHeader
            hasSubmittedToday={hasSubmittedToday}
            isEditing={isEditing}
            onEdit={handleEdit}
          />
          
          <TechnicianSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        <TechnicianList
          technicians={filteredTechnicians}
          attendanceStates={attendanceStates}
          updateStatus={updateStatus}
          isSubmitting={isSubmitting}
          hasSubmittedToday={hasSubmittedToday}
          isEditing={isEditing}
        />

        <AttendanceFormActions
          isEditing={isEditing}
          hasSubmittedToday={hasSubmittedToday}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancelEdit={handleCancelEdit}
        />
      </div>
    </div>
  );
};