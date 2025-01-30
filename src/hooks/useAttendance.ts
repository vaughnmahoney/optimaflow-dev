import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { AttendanceRecord, Technician } from "@/types/attendance";

export const useAttendance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return {
    technicians,
    todayAttendance,
    isLoadingTechnicians,
    isLoadingAttendance,
    submitAttendanceMutation,
  };
};