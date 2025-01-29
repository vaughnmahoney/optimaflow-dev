import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { AttendanceList } from "./AttendanceList";
import { AttendanceControls } from "./AttendanceControls";
import { useToast } from "@/hooks/use-toast";
import { useAttendance } from "@/hooks/useAttendance";
import { useAttendanceSubmission } from "@/hooks/useAttendanceSubmission";
import { useAttendanceDraft } from "@/hooks/useAttendanceDraft";
import { calculateAttendanceStats, validateAttendanceSubmission } from "@/utils/attendanceCalculations";
import type { AttendanceRecord } from "@/types/attendance";

export const AttendanceForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    technicians,
    todayAttendance,
    isLoadingTechnicians,
    isLoadingAttendance,
    submitAttendanceMutation,
  } = useAttendance();

  const {
    isEditing,
    setIsEditing,
    handleSubmission,
  } = useAttendanceSubmission();

  const {
    draftAttendance,
    updateDraft,
    clearDraft
  } = useAttendanceDraft(todayAttendance);

  const handleSubmit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to submit attendance.",
        variant: "destructive",
      });
      return;
    }

    if (!technicians) return;

    if (!validateAttendanceSubmission(draftAttendance, technicians.length)) {
      toast({
        title: "Warning",
        description: "Please mark attendance for all technicians before submitting.",
        variant: "destructive",
      });
      return;
    }

    const allSubmitted = technicians.every(tech => 
      todayAttendance?.find(record => 
        record.technician_id === tech.id && record.submitted_at !== null
      )
    );

    if (allSubmitted && !isEditing) {
      toast({
        title: "Notice",
        description: "Attendance already submitted for today. Click 'Edit Attendance' to make changes.",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const records = draftAttendance.map(record => ({
      technician_id: record.technician_id,
      supervisor_id: session.user.id,
      date: today,
      status: record.status
    }));

    if (records.length > 0) {
      const success = await handleSubmission(records);
      if (success) {
        clearDraft();
      }
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("attendance_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance_records",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["attendance"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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

  const allSubmitted = technicians.every(tech => 
    todayAttendance?.find(record => 
      record.technician_id === tech.id && record.submitted_at !== null
    )
  );

  const currentStats = calculateAttendanceStats(
    allSubmitted ? todayAttendance : draftAttendance
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <AttendanceControls
        stats={currentStats}
        allSubmitted={allSubmitted}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
      />
      <AttendanceList
        technicians={technicians}
        todayAttendance={isEditing || !allSubmitted ? draftAttendance : todayAttendance}
        onStatusChange={updateDraft}
        onSubmit={handleSubmit}
        isSubmitting={submitAttendanceMutation.isPending}
        isEditable={!allSubmitted || isEditing}
      />
    </div>
  );
};