import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { AttendanceList } from "./AttendanceList";
import { AttendanceControls } from "./AttendanceControls";
import { useToast } from "@/hooks/use-toast";
import { useAttendance } from "@/hooks/useAttendance";
import { useAttendanceSubmission } from "@/hooks/useAttendanceSubmission";
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

  const handleStatusChange = async (technicianId: string, status: AttendanceRecord["status"]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to submit attendance.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const newRecord = {
      technician_id: technicianId,
      supervisor_id: session.user.id,
      date: today,
      status,
    };

    submitAttendanceMutation.mutate([newRecord], {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["attendance"] });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update status. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

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

    // Check if all technicians have attendance marked
    const unmarkedTechnicians = technicians?.filter(
      tech => !todayAttendance?.find(record => record.technician_id === tech.id)
    );

    if (unmarkedTechnicians?.length > 0) {
      toast({
        title: "Warning",
        description: `Please mark attendance for all technicians before submitting.`,
        variant: "destructive",
      });
      return;
    }

    // Check if attendance is already submitted for today (all technicians have records)
    const allSubmitted = technicians?.every(tech => 
      todayAttendance?.find(record => record.technician_id === tech.id)
    );

    if (allSubmitted && !isEditing) {
      toast({
        title: "Notice",
        description: "Attendance already submitted for today. Click 'Edit Attendance' to make changes.",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const records = technicians?.map(tech => ({
      technician_id: tech.id,
      supervisor_id: session.user.id,
      date: today,
      status: todayAttendance?.find(record => record.technician_id === tech.id)?.status || "absent"
    }));

    if (records) {
      await handleSubmission(records);
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

  const calculateStats = (records: AttendanceRecord[] = []) => {
    const stats = {
      present: 0,
      absent: 0,
      excused: 0,
      total: records.length
    };

    records.forEach(record => {
      if (record.status === 'present') stats.present++;
      else if (record.status === 'absent') stats.absent++;
      else if (record.status === 'excused') stats.excused++;
    });

    return stats;
  };

  const allSubmitted = technicians?.every(tech => 
    todayAttendance?.find(record => record.technician_id === tech.id)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <AttendanceControls
        stats={calculateStats(todayAttendance)}
        allSubmitted={allSubmitted}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
      />
      <AttendanceList
        technicians={technicians}
        todayAttendance={todayAttendance}
        onStatusChange={handleStatusChange}
        onSubmit={handleSubmit}
        isSubmitting={submitAttendanceMutation.isPending}
        isEditable={!allSubmitted || isEditing}
      />
    </div>
  );
};