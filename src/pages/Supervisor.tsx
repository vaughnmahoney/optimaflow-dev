import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AttendanceRecord, Technician } from "@/types/attendance";
import { AttendanceList } from "@/components/attendance/AttendanceList";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { useNavigate } from "react-router-dom";

const Supervisor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch technicians with proper error handling
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .eq("supervisor_id", session.user.id)
        .order("name");
      
      if (error) throw error;
      return data as Technician[];
    },
  });

  // Fetch today's attendance records
  const { data: todayAttendance, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance", new Date().toISOString().split("T")[0]],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("date", today)
        .eq("supervisor_id", session.user.id);
      
      if (error) throw error;
      return data as AttendanceRecord[];
    },
  });

  // Submit attendance mutation
  const submitAttendanceMutation = useMutation({
    mutationFn: async (records: Omit<AttendanceRecord, "id" | "submitted_at" | "updated_at">[]) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("attendance_records")
        .upsert(records.map(record => ({
          ...record,
          supervisor_id: session.user.id
        })))
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({
        title: "Success",
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

  // Calculate attendance stats
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
          onSubmit={handleSubmit}
          isSubmitting={submitAttendanceMutation.isPending}
        />

        <AttendanceStats stats={calculateStats(todayAttendance)} />
      </div>
    </Layout>
  );
};

export default Supervisor;