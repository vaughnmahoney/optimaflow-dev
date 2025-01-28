import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AttendanceRecord, Technician } from "@/types/attendance";

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

    if (existingRecord) {
      // TODO: Implement update logic when needed
      return;
    }

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

  const getStatusColor = (status?: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return "bg-success/10 text-success border-success/20";
      case "absent":
        return "bg-danger/10 text-danger border-danger/20";
      case "excused":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-gray-50 text-gray-500 border-gray-200";
    }
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

  const getAttendanceStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      excused: 0,
    };

    todayAttendance?.forEach((record) => {
      if (record.status in stats) {
        stats[record.status as keyof typeof stats]++;
      }
    });

    return stats;
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-primary">Supervisor Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Mark attendance for your team
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Today's Attendance</h3>
            <Button
              onClick={() => {}}
              disabled={isLoadingAttendance || submitAttendanceMutation.isPending}
            >
              {submitAttendanceMutation.isPending ? "Submitting..." : "Submit Attendance"}
            </Button>
          </div>

          <div className="space-y-4">
            {technicians.map((tech) => {
              const todayRecord = todayAttendance?.find(
                (record) => record.technician_id === tech.id
              );

              return (
                <div
                  key={tech.id}
                  className="p-4 rounded-lg border bg-gray-50/50 animate-slide-in"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{tech.name}</h4>
                      <p className="text-sm text-gray-500">{tech.email}</p>
                    </div>
                    <div className="flex gap-2">
                      {["present", "absent", "excused"].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleStatusChange(
                              tech.id,
                              status as AttendanceRecord["status"]
                            )
                          }
                          disabled={submitAttendanceMutation.isPending || !!todayRecord}
                          className={`px-4 py-2 rounded-md border transition-colors ${
                            todayRecord?.status === status
                              ? getStatusColor(status as AttendanceRecord["status"])
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(getAttendanceStats()).map(([status, count]) => (
              <div
                key={status}
                className={`p-4 rounded-lg border ${getStatusColor(
                  status as AttendanceRecord["status"]
                )}`}
              >
                <p className="text-sm text-gray-600">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
                <p className="text-2xl font-semibold mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Supervisor;