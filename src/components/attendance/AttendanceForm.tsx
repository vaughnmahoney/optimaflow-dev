import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { AttendanceList } from "./AttendanceList";
import { AttendanceStats } from "./AttendanceStats";
import type { AttendanceRecord, Technician } from "@/types/attendance";
import { useAttendance } from "@/hooks/useAttendance";

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

    submitAttendanceMutation.mutate([newRecord]);
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

    const today = new Date().toISOString().split("T")[0];
    const records = technicians?.map(tech => ({
      technician_id: tech.id,
      supervisor_id: session.user.id,
      date: today,
      status: todayAttendance?.find(record => record.technician_id === tech.id)?.status || "absent"
    }));

    if (records) {
      submitAttendanceMutation.mutate(records);
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

  return (
    <div className="space-y-8 animate-fade-in">
      <AttendanceList
        technicians={technicians}
        todayAttendance={todayAttendance}
        onStatusChange={handleStatusChange}
        onSubmit={handleSubmit}
        isSubmitting={submitAttendanceMutation.isPending}
      />
      <AttendanceStats stats={calculateStats(todayAttendance)} />
    </div>
  );
};