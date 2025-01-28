import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AttendanceRecord, Technician } from "@/types/attendance";
import { AttendanceList } from "@/components/attendance/AttendanceList";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";

const Supervisor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch technicians
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Technician[];
    },
  });

  // Fetch today's attendance records
  const { data: todayAttendance, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance", new Date().toISOString().split("T")[0]],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("date", today);
      
      if (error) throw error;
      return data as AttendanceRecord[];
    },
  });

  // Submit attendance mutation
  const submitAttendanceMutation = useMutation({
    mutationFn: async (records: Omit<AttendanceRecord, "id" | "submitted_at" | "updated_at">[]) => {
      const { data, error } = await supabase
        .from("attendance_records")
        .insert(records)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({
        title: "Attendance submitted",
        description: "Today's attendance has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit attendance. Please try again.",
        variant: "destructive",
      });
      console.error("Error submitting attendance:", error);
    },
  });

  const handleStatusChange = async (technicianId: string, status: AttendanceRecord["status"]) => {
    if (submitAttendanceMutation.isPending) return;

    const existingRecord = todayAttendance?.find(
      (record) => record.technician_id === technicianId
    );

    if (existingRecord) return;

    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const newRecord = {
      technician_id: technicianId,
      supervisor_id: user.data.user.id,
      date: new Date().toISOString().split("T")[0],
      status,
    };

    submitAttendanceMutation.mutate([newRecord]);
  };

  // Set up real-time subscription
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
      <Layout>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-primary">Supervisor Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Mark attendance for your team
          </p>
        </div>

        <AttendanceList
          technicians={technicians}
          todayAttendance={todayAttendance}
          onStatusChange={handleStatusChange}
          isSubmitting={submitAttendanceMutation.isPending}
        />

        <AttendanceStats todayAttendance={todayAttendance} />
      </div>
    </Layout>
  );
};

export default Supervisor;